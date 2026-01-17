# API Contracts: Basketball AI Prediction Agent

## 1. Market Exploration
`GET /api/markets`

**Query Parameters:**
- `type`: String (required: "games" | "props")
- `league`: String (optional: "NBA", "EuroLeague", "NCAA")
- `search`: String (optional)
- `page`: Number (default: 1)
- `pageSize`: Number (default: 30)

**Response (Games):**
```json
{
  "markets": [
    {
      "id": "poly-123",
      "league": "NBA",
      "startTime": "2026-01-18T02:00:00Z",
      "volume": 712960.0,
      "commentCount": 38,
      "homeTeam": { "name": "Utah Jazz", "wins": 14, "losses": 27, "logo": "..." },
      "awayTeam": { "name": "Dallas Mavericks", "wins": 16, "losses": 26, "logo": "..." },
      "moneyline": { "home": 0.42, "away": 0.60 },
      "spread": { "home": "+4.5", "homeOdds": 0.56, "away": "-4.5", "awayOdds": 0.46 },
      "total": { "over": "242.5", "overOdds": 0.48, "under": "242.5", "underOdds": 0.53 }
    }
  ],
  "total": 156,
  "page": 1,
  "pageSize": 30,
  "nextPage": 2
}
```

**Response (Props):**
```json
{
  "markets": [
    {
      "id": "prop-456",
      "league": "NBA",
      "question": "Will LeBron James score 30+ points?",
      "startTime": "2026-01-18T02:00:00Z",
      "volume": 45000.0,
      "outcomes": ["Yes", "No"],
      "prices": [0.35, 0.65]
    }
  ],
  "total": 85,
  "page": 1,
  "pageSize": 30
}
```

## 2. Trigger/Fetch Analysis
`POST /api/analysis`

**Request Body:**
```json
{
  "marketId": "poly-123",
  "currentOdds": 0.55
}
```

**Response:**
```json
{
  "id": "analysis-abc",
  "isCached": true,
  "data": {
    "predictedProbability": 0.58,
    "marketImplied": 0.55,
    "edge": 0.03,
    "confidence": 85,
    "report": "Based on the Lakers recent form and AD returning...",
    "dimensions": {
      "form": "High",
      "injuries": "Minor",
      "schedule": "Neutral"
    }
  }
}
```
