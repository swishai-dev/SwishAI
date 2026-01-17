# API Contracts: Basketball Prediction Agent

## Explorer API

### GET /api/markets
Fetches filtered and aggregated basketball markets.

**Query Parameters:**
- `type`: `GAMES` | `PROPS` (required)
- `league`: `NBA` | `EURO` | `NCAA` (optional)
- `search`: string (optional)
- `page`: number (default: 1)
- `pageSize`: number (default: 30)

**Response (GAMES):**
```json
{
  "markets": [
    {
      "id": "matchup_uuid",
      "startTime": "2026-01-20T19:00:00Z",
      "homeTeam": { "name": "Lakers", "logo": "..." },
      "awayTeam": { "name": "Celtics", "logo": "..." },
      "volume": 125000.50,
      "markets": {
        "moneyline": { "id": "pm_id_1", "odds": [0.45, 0.55] },
        "spread": { "id": "pm_id_2", "odds": [0.50, 0.50], "line": -4.5 },
        "total": { "id": "pm_id_3", "odds": [0.52, 0.48], "line": 224.5 }
      }
    }
  ],
  "pagination": { "current": 1, "total": 5 }
}
```

**Response (PROPS):**
```json
{
  "markets": [
    {
      "id": "prop_uuid",
      "question": "Will LeBron James score over 25.5 points?",
      "outcomes": ["Yes", "No"],
      "currentOdds": [0.65, 0.35],
      "volume": 4500.00
    }
  ],
  "pagination": { "current": 1, "total": 10 }
}
```

## Analysis API

### POST /api/analysis
Triggers or retrieves an AI analysis for a specific market state.

**Request Body:**
```json
{
  "marketId": "matchup_or_prop_uuid",
  "currentOdds": [0.45, 0.55],
  "matchup": { "home": "Lakers", "away": "Celtics" } // Optional context
}
```

**Response:**
```json
{
  "id": "analysis_uuid",
  "prediction": "Lakers",
  "probability": 0.58,
  "edge": 0.13,
  "reasoning": "### Report\nAnalysis based on recent home performance...",
  "cached": true,
  "lastUpdated": "2026-01-17T12:00:00Z"
}
```
