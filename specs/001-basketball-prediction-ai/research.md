# Research: Basketball AI Prediction Agent

## Technical Approach

### 1. AI Analysis & Inference Strategy
- **Core Engine**: Hybrid approach combining statistical modeling with Large Language Model (LLM) reasoning.
- **Data Input**: Ingests Polymarket market state (odds, liquidity) and external basketball metrics (NBA/EuroLeague/NCAA).
- **Inference Pipeline**:
  1. Fetch market data from Polymarket API.
  2. Fetch team performance (for Games) or player stats (for Props).
  3. Pre-process data into a structured prompt for the LLM.
  4. Generate predicted probability, confidence score, and natural language analysis.
  5. Store output in PostgreSQL with a unique hash of the input state.

### 2. Polymarket Integration (Gamma API)
- **Games Section**: 
  - Filter: Basketball category.
  - Aggregation: Group markets by `groupItemTitle` or `question` patterns (ML, Spread, Total).
  - Logic: Match "vs" or "Winner" questions.
- **Props Section**:
  - Filter: Basketball category.
  - Logic: Identify markets that are NOT game-winners/spreads/totals. Look for "Will", "Player", "Points", "Rebounds", "Assists" in `question`.
  - Display: Single-market layout as they don't group like games.

### 3. Animation & UX Strategy
- **Dashboard Style**: Recreate the Polymarket "Sports Dashboard" aesthetic.
  - **Games View**: Single-column rows with Betting Grid (ML/Spread/Total).
  - **Props View**: Grid or list of specialized cards showing the specific prop question and binary (Yes/No) odds.
- **Simulation Logic**: Implement a `useSimulatedInference` hook using GSAP timelines to reveal insights (Probability -> Market Odds -> Edge -> Analyst Text).
- **3D Visuals**: Three.js for an interactive 3D basketball in the hero section.

### 4. Caching & Replay Mechanism
- **Identification**: Analyses are cached using `stateHash` (marketId + oddsBin + date).
- **Replay**: Cached data triggers the same GSAP reveal sequence as fresh data.

## Dependencies
- **Framework**: `next` (App Router)
- **Styling**: `tailwind-css`
- **Animations**: `gsap`, `framer-motion`, `three`
- **Data Fetching**: Native `fetch` (Gamma REST API)
- **AI**: AI SDK (OpenAI/Anthropic)
- **Database**: `prisma` + `postgresql`

## Risks & Mitigations
- **Data Parity**: Polymarket API might have inconsistencies in naming.
  - **Mitigation**: Use robust regex and fuzzy matching for grouping markets.
- **High Volatility**: Odds might change during the "reveal" animation.
  - **Mitigation**: Fetch latest odds at the end of animation to show "Updated Edge".
