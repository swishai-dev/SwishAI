# Research: Polymarket Gamma REST API for Basketball

## Decision: Polymarket Gamma REST API Integration

The system will transition from GraphQL/Subgraph methods to the **Polymarket Gamma REST API**. This API is robust, provides real-time market data, and includes specialized endpoints for sports metadata.

### Rationale
- **Direct Access**: Gamma API provides direct access to events and markets without the overhead or potential staleness of a subgraph.
- **Sports-Specific Metadata**: The `/sports` endpoint allows for precise discovery of `series_id` and `tag_id` for basketball leagues (NBA, NCAA, EuroLeague).
- **Comprehensive Data**: The `/events` endpoint returns nested markets, facilitating the "Aggregated Matchup" requirement (Moneyline, Spread, Total) in a single response.

### Key Discoveries & Implementation Patterns

#### 1. Discovery Phase (One-time or periodic)
Fetch basketball series and tags:
```bash
GET https://gamma-api.polymarket.com/sports
```
Identify entries where `sport: "Basketball"` or tags like `"NBA"`, `"NCAA Basketball"`, `"EuroLeague"`.

#### 2. Fetching Games (Matchups)
Use the `/events` endpoint to get scheduled games and their associated markets:
```bash
GET https://gamma-api.polymarket.com/events?tag_id=<BASKETBALL_TAG_ID>&active=true&closed=false&order=startTime&ascending=true
```
- **Aggregation Strategy**: Group nested markets within each event by their `question` or `groupItemTitle`. Standard labels for Moneyline, Spread, and Total can be extracted from market titles.

#### 3. Fetching Props
Props can be identified by keywords in the market `question` (e.g., "Will [Player] score...", "How many rebounds..."). Use the `/markets` endpoint for a flatter search of individual prop markets.
```bash
GET https://gamma-api.polymarket.com/markets?tag_id=<BASKETBALL_TAG_ID>&active=true&closed=false&search=<PLAYER_NAME>
```

#### 4. Ensuring Data Accuracy
- **Market Integrity**: Always use the `id` from the API to link to the source.
- **Price Resolution**: Use `outcomePrices` (JSON array) for the current market odds.
- **Outcome Mapping**: Map `outcomes` (e.g., ["Yes", "No"] or ["Team A", "Team B"]) directly from the API response to avoid hardcoded assumptions.

### Alternatives Considered
- **Polymarket Subgraph (GraphQL)**: Rejected due to deprecation concerns and inconsistent performance reported in earlier phases.
- **Third-party Odds APIs**: Rejected because the primary requirement is integration with Polymarket prediction markets specifically.

### Unknowns & Risks
- **Rate Limiting**: Need to monitor Gamma API rate limits; implement a local cache (Prisma) with a 60-second TTL to minimize redundant calls.
- **Series IDs Stability**: Series IDs (like "NBA 2025") might change seasonally. Implement a flexible configuration or discovery mechanism in `lib/data/polymarket.ts`.
