# Feature Specification: Basketball Data Fetching Layer (Polymarket Gamma API)

**Feature Branch**: `003-basketball-data-layer`  
**Created**: 2026-01-17  
**Status**: Draft  
**Input**: User description: "Build a data-fetching layer and API specification that retrieves ONLY active and upcoming basketball markets from Polymarket using the official Gamma API."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover Upcoming Basketball Games (Priority: P1)

As a frontend developer or end-user, I want to retrieve a clean list of active and upcoming basketball games (matchups) so that I can display them in a dashboard without noise from futures or non-basketball events.

**Why this priority**: Core functionality needed to build the sports dashboard. Filtering out "junk" data (futures, awards) is essential for user experience.

**Independent Test**: Fetch the list of games and verify that every entry is a basketball matchup (Team A vs Team B) from NBA, NCAA, or EuroLeague, and that no season-long awards or resolved games are present.

**Acceptance Scenarios**:

1. **Given** the Polymarket Gamma API is accessible, **When** requesting basketball games, **Then** only active games with `closed=false` are returned.
2. **Given** a list of games, **When** checking titles, **Then** only titles in the "Team A vs. Team B" format are included.
3. **Given** multiple upcoming games, **When** sorted, **Then** they appear in descending order by `start_time`.

---

### User Story 2 - Access Core Betting Props (Priority: P2)

As a user interested in betting odds, I want to see only the primary "head" props (Moneyline, Spread, and Totals) for each game so that I can quickly assess the market sentiment without being overwhelmed by individual player statistics.

**Why this priority**: Essential for providing the basic betting information users expect. Player props are explicitly out of scope to maintain focus.

**Independent Test**: For a specific game ID, retrieve the props and verify that only "Moneyline", "Spread", and "Totals" market types are included.

**Acceptance Scenarios**:

1. **Given** an active game, **When** fetching its markets, **Then** any player-specific props (e.g., "LeBron points") are filtered out.
2. **Given** a prop, **When** checking outcomes, **Then** they match the binary "Yes/No" or "Over/Under" structure expected for those types.

---

### User Story 3 - Paginated Real-time Usage (Priority: P3)

As a system builder, I want the data layer to support pagination and return a consistent JSON structure so that the UI remains performant even as the number of active markets grows.

**Why this priority**: Ensures the system is robust and scalable for a production UI.

**Independent Test**: Request multiple pages of results and verify the total count and offset logic work as expected.

**Acceptance Scenarios**:

1. **Given** many upcoming games, **When** requesting with page size parameters, **Then** only the specified number of games is returned per call.

---

## Edge Cases

- **Postponed Games**: How are games with changed start times handled? (Strategy: API filter `active=true` and `closed=false` should reflect current status on Polymarket).
- **Multiple "Head" Markets**: If an event has multiple spread markets, which one is chosen? (Strategy: Mirror Polymarket UI "head" prop selection logic, usually the most liquid or default).
- **Network Timeouts**: How does the layer handle Gamma API downtime? (Strategy: Implement basic error responses that notify the UI data is temporarily unavailable).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch data exclusively from the Polymarket Gamma API (`https://gamma-api.polymarket.com`).
- **FR-002**: System MUST apply filters `active=true` AND `closed=false` to all requests to ensure only tradeable markets are retrieved.
- **FR-003**: System MUST filter events to include ONLY NBA, NCAA Basketball, and EuroLeague.
- **FR-004**: System MUST include ONLY real team matchups ("Team A vs Team B") and exclude all futures, awards, or speculative markets.
- **FR-005**: For each Game (Event), the system MUST return: `event_id`, `league`, `home_team`, `away_team`, `start_time` (UTC), and `event_title`.
- **FR-006**: System MUST filter props to include ONLY "Moneyline/Winner", "Spread", and "Totals".
- **FR-007**: System MUST completely exclude player props (e.g., points, assists, rebounds) and player names.
- **FR-008**: For each Prop (Market), the system MUST return: `market_id`, `event_id`, `prop_type` (moneyline | spread | totals), `prop_title`, `outcomes`, and `current_status`.
- **FR-009**: Results MUST be ordered by `start_time` descending (upcoming games first).
- **FR-010**: API specification MUST support pagination parameters (limit, offset).
- **FR-011**: Output MUST be clean JSON with no derived analytics or inferred data.

### Key Entities *(include if feature involves data)*

- **Game (Event)**: Represents a single basketball matchup between two teams.
- **Prop (Market)**: Represents a specific betting market associated with a Game (limited to Moneyline, Spread, or Totals).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of returned markets are active and not resolved.
- **SC-002**: 0% incidence of player-specific props in the output.
- **SC-003**: Data structure exactly matches the Polymarket Gamma API naming conventions where applicable.
- **SC-004**: API response handles filtering and mapping in under 200ms (system latency excluding external API call).
- **SC-005**: 100% of returned games belong to the specified leagues (NBA, NCAA, EuroLeague).

## Assumptions

- The Polymarket Gamma API remains the source of truth for "active" and "upcoming" status.
- Matchups can be reliably identified by titles containing "vs" or "vs." and league metadata.
- "Head" props on Polymarket correspond to specific market tags or slugs that can be used for filtering.
