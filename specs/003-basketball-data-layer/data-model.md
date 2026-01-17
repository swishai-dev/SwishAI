# Data Model: Basketball Data Layer

## Entities

### Game
A single basketball matchup between two teams.
- `id`: UUID (Primary Key)
- `externalId`: Polymarket Event ID (String, Unique)
- `league`: Enum (NBA, NCAA, EURO)
- `homeTeam`: String
- `awayTeam`: String
- `startTime`: DateTime (UTC)
- `eventTitle`: String
- `status`: String (ACTIVE)
- `updatedAt`: DateTime

### Prop
A core betting market associated with a Game.
- `id`: UUID (Primary Key)
- `gameId`: UUID (Foreign Key to Game)
- `externalId`: Polymarket Market ID (String, Unique)
- `type`: Enum (MONEYLINE, SPREAD, TOTALS)
- `title`: String (Exact market question)
- `outcomes`: String[] (e.g., ["Yes", "No"])
- `currentOdds`: Float[] (Implied probabilities)
- `status`: String (ACTIVE)

### MarketSnapshot
A persisted snapshot of normalized data for audit and fallback.
- `id`: UUID
- `league`: String
- `payload`: Json (Normalized list of Games and Props)
- `payloadHash`: String (SHA-256 for cache invalidation)
- `createdAt`: DateTime

## Relationships
- `Game` has many `Props`.
- `Game` and `Prop` are normalized from Polymarket `Event` and `Market` raw data.

## Cache Schema (Redis)
- Key: `swish:v1:games:{league}:{page}`
- TTL: 300 seconds (5 minutes)
- Value: Normalized JSON payload
