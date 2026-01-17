# Tasks: Basketball Data Fetching Layer (Polymarket Gamma API)

**Input**: Design documents from `/specs/003-basketball-data-layer/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api.md

**Tests**: Unit tests for normalization logic in services are included as requested by the plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and core configuration

- [x] T001 Create service and API directory structure per implementation plan (`lib/services`, `app/api/v1`)
- [x] T002 [P] Configure environment variables in `.env` (DATABASE_URL, REDIS_URL, GAMMA_API_BASE)
- [x] T003 [P] Setup base TypeScript interfaces in `types/polymarket.ts` (raw API) and `types/domain.ts` (normalized)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update Prisma schema with Game, Prop, and MarketSnapshot models in `prisma/schema.prisma`
- [x] T005 [P] Implement Prisma client singleton in `lib/db.ts`
- [x] T006 [P] Implement Redis client singleton in `lib/redis.ts`
- [x] T007 Implement basic `PolymarketService` for Gamma API communication in `lib/services/polymarket.ts`
- [x] T008 [P] Configure global error handling and logging in `lib/logger.ts`

**Checkpoint**: Foundation ready - services can now be implemented following the normalization pipeline.

---

## Phase 3: User Story 1 - Discover Upcoming Basketball Games (Priority: P1) 🎯 MVP

**Goal**: Fetch and display active basketball matchups (NBA, NCAA, EuroLeague) in a robust card layout (one per row).

**Independent Test**: Call `GET /api/v1/games` and verify only active basketball matchups are returned.

### Implementation for User Story 1

- [x] T009 [P] [US1] Implement `GameService` with logic to filter only real matchups (vs/@) in `lib/services/game.ts`
- [x] T010 [US1] Create API endpoint `GET /api/v1/games` in `app/api/v1/games/route.ts`
- [x] T011 [US1] Implement `GameCard` UI component with robust design (one per row) in `components/explorer/GameCard.tsx`
- [x] T012 [US1] Integrate `GameCard` list into the main explorer dashboard in `app/explorer/page.tsx`
- [x] T013 [US1] Unit test for `GameService` normalization logic in `lib/services/__tests__/game.test.ts`

**Checkpoint**: User Story 1 functional - basic dashboard shows active games.

---

## Phase 4: User Story 2 - Access Core Betting Props (Priority: P2)

**Goal**: Fetch and display only Moneyline, Spread, and Totals for each game.

**Independent Test**: Call `GET /api/v1/games/[id]/props` for a known event and verify only head props are returned.

### Implementation for User Story 2

- [x] T014 [P] [US2] Implement `PropService` to filter head props from nested markets in `lib/services/prop.ts`
- [x] T015 [US2] Create API endpoint `GET /api/v1/games/[id]/props` in `app/api/v1/games/[id]/props/route.ts`
- [x] T016 [US2] Update `GameCard` to display Moneyline, Spread, and Totals in `components/explorer/GameCard.tsx`
- [x] T017 [US2] Unit test for `PropService` filtering logic in `lib/services/__tests__/prop.test.ts`

**Checkpoint**: User Story 2 functional - game cards now show live odds for head props.

---

## Phase 5: User Story 3 - Paginated Real-time Usage (Priority: P3)

**Goal**: Support paging (30 per page) and Redis-based caching with simulation delay.

**Independent Test**: Request multiple pages and verify 30 results per page and cache headers.

### Implementation for User Story 3

- [x] T018 [P] [US3] Implement `CacheService` with Redis and artificial simulation delay in `lib/services/cache.ts`
- [x] T019 [US3] Add pagination logic to `GameService` and `GET /api/v1/games` endpoint (pageSize: 30)
- [x] T020 [US3] Implement pagination controls in UI dashboard in `app/explorer/page.tsx`
- [x] T021 [US3] Implement `MarketSnapshot` persistence for fallback in `lib/services/snapshot.ts`

**Checkpoint**: All user stories complete with performance optimizations.

---

## Phase N: Polish & Cross-Cutting Concerns

- [x] T022 Implement 503 error handling with fallback data in `app/api/v1/games/route.ts`
- [x] T023 Add Framer Motion reveal animations to `GameCard` and Prop reveal
- [x] T024 Run `quickstart.md` validation on clean environment
- [x] T025 [P] Cleanup unused code and documentation sync

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all story work.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
- **Polish**: Final stage after all stories are verified.

### User Story Dependencies

- **US1 (P1)**: Core dashboard - BLOCKS US2/US3 UI work.
- **US2 (P2)**: Extends US1 with odds.
- **US3 (P3)**: Optimizes US1/US2 for production scale.

---

## Implementation Strategy

### MVP First
1. Complete Setup and Foundational.
2. Deliver US1 with the robust `GameCard` layout.
3. Add US2 for betting odds.
4. Finalize with US3 paging and caching.

### Parallel Opportunities
- T002 and T003 in Setup.
- T005, T006, and T008 in Foundational.
- Once Foundation is ready, backend services (T009, T014) can start in parallel with UI work (T011).
