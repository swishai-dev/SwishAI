# Data Model: Basketball Prediction Agent

## Entities

### Team
Represents a basketball team involved in matchups.
- `id`: Internal UUID
- `name`: Full name (e.g., "Los Angeles Lakers")
- `symbol`: Short symbol (e.g., "LAL")
- `logoUrl`: URL to team logo
- `league`: League identifier (NBA, EuroLeague, etc.)

### Matchup (Aggregated)
A single basketball game entity derived from a Polymarket Event.
- `id`: Internal UUID
- `externalEventId`: Polymarket Event ID (string)
- `homeTeamId`: Reference to Team
- `awayTeamId`: Reference to Team
- `startTime`: Kickoff time (DateTime)
- `status`: Scheduled, Live, Completed
- `volume`: Total trading volume across all markets in the matchup

### Market (Polymarket Link)
Individual markets linked to a Matchup or standalone Prop.
- `id`: Internal UUID
- `externalMarketId`: Polymarket Market ID (string)
- `matchupId`: Optional reference to Matchup (for ML, Spread, Total)
- `type`: MONEYLINE, SPREAD, TOTAL, PROP
- `question`: The market question (e.g., "Will Lakers beat Celtics?")
- `outcomes`: Array of outcome names (e.g., ["Yes", "No"])
- `currentOdds`: JSON blob of outcome prices
- `updatedAt`: Last sync timestamp

### Analysis
AI-generated report for a specific market or matchup.
- `id`: Internal UUID
- `marketId`: Reference to Market (or Matchup if aggregated analysis)
- `prediction`: Suggested outcome
- `probability`: AI-calculated probability (Float)
- `reasoning`: Detailed markdown report
- `stateHash`: A hash of the market state (odds, volume, time) when analysis was generated (for cache invalidation)
- `createdAt`: Generation timestamp

## Relationships
- `Matchup` has many `Markets`.
- `Market` (or `Matchup`) has many `Analyses`.
- `Team` has many `Matchups` (as home or away).

## Validation Rules
- Basketball-only constraint enforced via `league` field.
- Markets must have unique `externalMarketId`.
- Analyses are tied to a `stateHash` to ensure they are re-evaluated if odds shift significantly.
