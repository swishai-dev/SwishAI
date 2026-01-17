# Quickstart: Basketball AI Prediction Agent

## Local Development

### 1. Prerequisites
- Node.js 18+
- PostgreSQL instance
- API Keys:
  - OpenAI/Anthropic
  - Basketball Data Provider (e.g., RapidAPI)

### 2. Setup
```bash
# Install dependencies
npm install

# Setup database
npx prisma db push

# Run development server
npm run dev
```

### 3. Core Files to Edit
- `app/api/analysis/route.ts`: Inference logic & caching.
- `app/api/markets/route.ts`: Polymarket integration.
- `components/AnalysisDisplay.tsx`: GSAP/Framer Motion animation logic.
- `lib/ai/analyst.ts`: LLM prompt engineering.

## Verification
- Visit `localhost:3000/explorer` to see filtered markets.
- Click a market to trigger analysis; verify the 4-7 second animated sequence.
- Check database `Analysis` table to verify persistence.
