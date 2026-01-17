# Research: Polymarket Gamma API for Basketball Data Layer

## Decision: Layered Data Fetching & Normalization

The system will use the **Polymarket Gamma REST API** as the primary data source. To fulfill the "ONLY active/upcoming basketball" and "Mirror Polymarket exactly" requirements, a strict three-stage pipeline will be implemented: **Discovery** (via `/sports`), **Ingestion** (via `/events`), and **Filtering** (via `marketType` and keyword analysis).

### Rationale
- **Discovery**: Using the `/sports` endpoint ensures we stay updated with seasonal `series_id` changes for NBA, NCAA, and EuroLeague.
- **Efficiency**: The `/events` endpoint is preferred for Games as it returns nested markets, allowing for a single request per matchup rather than separate market lookups.
- **Accuracy**: Explicitly filtering for `active=true` and `closed=false` ensures no expired data. Keyword filtering on `title` and `slug` ensures only real team matchups (vs/@) are included.

### Key Discoveries & Implementation Patterns

#### 1. League Identification
We will use the `/sports` metadata to map slugs to `tag_id` and `series_id`:
- **NBA**: `sport: "nba"`, usually `tag_id: 745`.
- **NCAA**: `sport: "ncaab"`, usually `tag_id: 100149`.
- **EuroLeague**: Discovered via `/tags` search for "EuroLeague" or "Euro Cup".

#### 2. "Head" Prop Selection Logic
To mirror Polymarket's primary game cards, the `PropService` will filter nested markets within an event:
- **Moneyline**: `marketType: "moneyline"` or `slug` containing "winner".
- **Spread**: `marketType: "spread"` or `question` containing "spread".
- **Totals**: `marketType: "total"` or `question` containing "over/under".
- **Exclusion**: Any market with a `groupItemTitle` or `question` mentioning specific player names or stats (points, assists) will be discarded.

#### 3. Start Time & Recency
- Use `startTime` from the `/events` response.
- Sort by `startTime` ASC for upcoming and DESC for recent active games.
- Filter: `startTime` >= current UTC time (for upcoming).

#### 4. Caching & Simulation
- **Redis Cache**: Store normalized JSON with a key format: `swish:v1:games:{league}:{page}`.
- **Simulation Delay**: When a cache hit occurs, `CacheService` will inject a `setTimeout` (e.g., 500-1500ms) to maintain the UX of "AI Analyzing live markets."

### Alternatives Considered
- **Direct GraphQL**: Rejected due to high complexity and potential deprecation of the Goldsky subgraphs.
- **Individual Market Fetching**: Rejected as it would exceed rate limits when aggregating Moneyline, Spread, and Totals for multiple games.

### Unknowns & Risks
- **Rate Limiting**: Gamma API rate limits are not strictly documented but usually sit around 10-20 req/s for public usage. Redis caching is essential.
- **Data Gaps**: Some EuroLeague or NCAA events might missing "head" props (e.g., no Spread available). The system must handle partial data gracefully.
