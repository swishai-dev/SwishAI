# Tasks: Basketball AI Prediction Agent (Polymarket REST API)

**Feature**: Basketball AI Prediction Agent
**Plan**: [/specs/002-basketball-polymarket-api/plan.md](plan.md)

## Implementation Strategy
- **MVP First**: Focus on User Story 1 (Basketball Market Discovery) to establish the core data flow.
- **Incremental Delivery**: Deliver accurate "Games" view before implementing "Props" and AI analysis.
- **Data Integrity**: Implement strict keyword filtering in the service layer to fulfill the "basketball-only" requirement.

## Phase 1: Setup
- [X] T001 Initialize database schema with Basketball entities in `prisma/schema.prisma`
- [X] T002 Configure Polymarket Gamma API environment variables in `.env`
- [X] T003 Create directory structure for domain-driven organization per plan in `app/`, `components/`, and `lib/`

## Phase 2: Foundational
- [X] T004 Implement Polymarket Gamma REST API client with basic fetchers in `lib/data/polymarket.ts`
- [X] T005 Create robust basketball keyword filter (NBA, EuroLeague, NCAA, Basketball) in `lib/data/polymarket.ts`
- [X] T006 Implement market aggregation logic to group ML, Spread, and Total into a Matchup in `lib/data/polymarket.ts`

## Phase 3: User Story 1 - Basketball Market Discovery (Priority: P1)
**Goal**: Filtered list of only basketball markets with Games/Props toggle and 30 items per page.
**Independent Test**: Load `/explorer`, verify only basketball markets appear, toggle between "Games" and "Props" and see relevant data change. Verify exactly 30 items are requested/displayed per page.

- [X] T007 [P] [US1] Implement `GET /api/markets` endpoint with pagination and type filtering in `app/api/markets/route.ts`
- [X] T008 [P] [US1] Create `MarketRow` component for robust single-column display of Games in `components/explorer/MarketRow.tsx`
- [X] T009 [P] [US1] Create `PropCard` component for basketball player props in `components/explorer/PropCard.tsx`
- [X] T010 [P] [US1] Implement `Pagination` component for 30 items per page in `components/explorer/Pagination.tsx`
- [X] T011 [US1] Refactor `Explorer` page to use the new API, layout, and pagination in `app/(explorer)/explorer/page.tsx`

## Phase 4: User Story 2 - Accurate Matchup Data (Priority: P2)
**Goal**: Display verified betting metrics directly from Polymarket API without modification.
**Independent Test**: Compare odds on the explorer with live Polymarket.com data for the same ID.

- [X] T012 [P] [US2] Implement `BettingGrid` component to display ML, Spread, and Total odds in `components/explorer/BettingGrid.tsx`
- [X] T013 [US2] Integrate `BettingGrid` into `MarketRow` and ensure real-time data sync in `components/explorer/MarketRow.tsx`
- [X] T014 [US2] Implement error handling for missing or incomplete market data in `lib/data/polymarket.ts`

## Phase 5: User Story 3 - Specialized Basketball Analysis (Priority: P3)
**Goal**: Trigger AI analysis tailored to basketball metrics with 0% hallucinatory data.
**Independent Test**: Trigger analysis for a game, verify the report mentions basketball-specific context and uses verified stats.

- [X] T015 [P] [US3] Implement basketball-specific AI prompt engineering in `lib/ai/analyst.ts`
- [X] T016 [P] [US3] Create `POST /api/analysis` endpoint with state hashing and caching in `app/api/analysis/route.ts`
- [X] T017 [US3] Create `AnalysisReveal` component with GSAP animations in `components/analysis/AnalysisReveal.tsx`
- [X] T018 [US3] Build Matchup details page to show deep analysis in `app/(explorer)/matchup/[id]/page.tsx`

## Phase 6: Polish & Cross-Cutting Concerns
- [X] T019 Implement glassmorphism and neon accents across all components in `styles/globals.css`
- [X] T020 Optimize 3D animations in `components/shared/Hero.tsx` for mobile performance
- [X] T021 Final audit of "basketball-only" constraint and data accuracy across all user stories

## Dependencies
- US1 (T007-T011) depends on Phase 2 Foundational (T004-T006)
- US2 (T012-T014) depends on US1 completion
- US3 (T015-T018) depends on US2 completion

## Parallel Execution Examples
- **Setup & Foundational**: T001, T002, T003 can run in parallel.
- **User Story 1**: T007, T008, T009, T010 can run in parallel once T004-T006 are done.
- **User Story 3**: T015, T017 can run in parallel while T016 is being implemented.
