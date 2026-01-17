# API Contracts: Basketball Data Layer

## Endpoints

### GET /api/v1/games
Retrieves a paginated list of active and upcoming basketball games.

**Query Parameters:**
- `league`: `NBA` | `NCAA` | `EURO` | `ALL` (default: `ALL`)
- `page`: Number (default: 1)
- `pageSize`: Number (default: 30)
- `sort`: `startTime:asc` | `startTime:desc` (default: `startTime:desc`)

**Response:**
```json
{
  "games": [
    {
      "event_id": "pm_event_123",
      "league": "NBA",
      "home_team": "Lakers",
      "away_team": "Celtics",
      "start_time": "2026-01-20T19:00:00Z",
      "event_title": "Lakers vs Celtics"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pageSize": 30,
    "totalPages": 2
  }
}
```

### GET /api/v1/games/{id}/props
Retrieves only the "head" props for a specific game.

**Response:**
```json
{
  "event_id": "pm_event_123",
  "props": [
    {
      "market_id": "pm_market_456",
      "prop_type": "moneyline",
      "prop_title": "Will the Lakers beat the Celtics?",
      "outcomes": ["Lakers", "Celtics"],
      "current_status": "ACTIVE"
    },
    {
      "market_id": "pm_market_789",
      "prop_type": "spread",
      "prop_title": "Lakers -4.5 Spread",
      "outcomes": ["Yes", "No"],
      "current_status": "ACTIVE"
    }
  ]
}
```

## Error Formats

### 404 Not Found
```json
{
  "error": "Game not found",
  "code": "GAME_NOT_FOUND"
}
```

### 503 Service Unavailable (External API Down)
```json
{
  "error": "Polymarket API is temporarily unavailable",
  "code": "UPSTREAM_ERROR",
  "fallback_data": true // Indicates results are from the latest valid snapshot
}
```
