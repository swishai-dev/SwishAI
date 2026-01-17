# Tasks: Basketball AI Prediction Agent (Games & Props Update)

**Input**: Design documents from `specs/001-basketball-prediction-ai/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js app**: `app/`, `components/`, `lib/`, `tests/`
- Paths follow the project structure defined in `plan.md`

---

## Phase 1: Setup (Marked as Completed)

- [x] T001 Initialize Next.js project with App Router and TypeScript
- [x] T002 [P] Install primary dependencies: `gsap`, `framer-motion`, `three`, `@react-three/fiber`, `@react-three/drei`, `prisma`, `lucide-react`, `axios`
- [x] T003 [P] Configure Tailwind CSS with neon themes and glassmorphism utilities in `tailwind.config.ts` and `app/globals.css`
- [x] T004 Setup Prisma and initialize PostgreSQL schema in `prisma/schema.prisma` per `data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure updates for Games/Props data parity.

- [x] T005 [P] Create Prisma client and base models in `lib/db.ts`
- [x] T006 [P] Update `prisma/schema.prisma` with `wins`, `losses`, `volume`, `commentCount`, and `type` per `data-model.md`
- [x] T007 [P] Enhance `lib/data/polymarket.ts` to aggregate Moneyline, Spread, and Total markets by game (groupItemTitle)
- [x] T008 [P] Implement `type` (games/props) detection logic in `lib/data/polymarket.ts` using question keywords
- [x] T009 [P] Implement mock team record/logo provider in `lib/data/sports-api.ts` to support the new UI

---

## Phase 3: User Story 1 - Dashboard & Props UI (Priority: P1) 🎯 MVP

**Goal**: Recreate the Polymarket "Sports Dashboard" UI for Games and specialized cards for Props.

**Independent Test**: Verify that `/explorer` supports toggling between "Games" and "Props", with 30 items per page and appropriate layouts for each.

### Implementation for User Story 1

- [x] T010 [P] [US1] Update `GET /api/markets` in `app/api/markets/route.ts` to support `type=games|props` parameter
- [x] T011 [P] [US1] Build the "Betting Grid" sub-component (Moneyline, Spread, Total) in `components/explorer/BettingGrid.tsx`
- [x] T012 [P] [US1] Implement the robust single-column row UI in `components/explorer/MarketRow.tsx`
- [x] T013 [P] [US1] Create specialized `PropCard.tsx` for player props (Yes/No markets) in `components/explorer/PropCard.tsx`
- [x] T014 [US1] Update `app/explorer/page.tsx` with Games/Props toggle buttons and pagination logic
- [x] T015 [US1] Implement "Show Spreads + Totals" toggle logic in `app/explorer/page.tsx`

**Checkpoint**: User Story 1 complete - Dashboard supports both Games and Props with tailored layouts.

---

## Phase 4: User Story 2 - Deep Matchup Analysis (Priority: P2)

**Goal**: Trigger AI analysis for a specific game/prop and show animated insights.

- [x] T016 [P] [US2] Implement `POST /api/analysis` (inference logic) in `app/api/analysis/route.ts`
- [x] T017 [P] [US2] Implement LLM reasoning pipeline in `lib/ai/analyst.ts` (handle both game stats and player metrics)
- [x] T018 [US2] Create 3D Basketball Hero visual using Three.js in `components/shared/Hero.tsx`
- [x] T019 [US2] Update `AnalysisReveal` to include specific data points for Props (e.g., Hit Probability) in `components/analysis/AnalysisReveal.tsx`
- [x] T020 [US2] Create Matchup details page with AI analysis trigger in `app/matchup/[id]/page.tsx`
- [x] T021 [US2] Implement probability bars and confidence meters with smooth interpolations in `components/ui/MetricsDisplay.tsx`

---

## Phase 5: User Story 3 - Instant Analysis Replay (Priority: P3)

**Goal**: View cached analysis with simulated inference latency.

- [x] T022 [P] [US3] Implement state hashing and cache lookup logic in `app/api/analysis/route.ts`
- [x] T023 [P] [US3] Create `useSimulatedInference` hook to manage reveal state and timing in `hooks/useSimulatedInference.ts`
- [x] T024 [US3] Update `AnalysisReveal` to handle cached data with the same GSAP sequence in `components/analysis/AnalysisReveal.tsx`
- [x] T025 [US3] Implement auto-refresh logic in `app/api/analysis/route.ts` for odds shifts >5%

---

## Phase N: Polish & Cross-Cutting Concerns

- [x] T026 [P] Optimize Three.js assets and GSAP timelines for consistent 60fps in `components/shared/Hero.tsx`
- [x] T027 [P] Implement mobile-first responsive adjustments for the new Games/Props layouts
- [x] T028 Final code cleanup and type safety verification for the aggregated data structures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: Update detection logic for Props first.
- **User Story 1 (P1)**: `PropCard` implementation is the main remaining blocking task for UI parity.
- **User Story 2 & 3**: Existing implementations need minor updates to support Prop analysis specifically.

---

## Implementation Strategy

### Games & Props Parity
1. Update `polymarket.ts` to correctly categorize markets.
2. Build `PropCard.tsx` for the Props view.
3. Wire the toggle in `ExplorerPage` to fetch and render the correct type.
