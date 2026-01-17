# Feature Specification: Basketball AI Prediction Agent (Polymarket REST API)

**Feature Branch**: `002-basketball-polymarket-api`  
**Created**: 2026-01-17  
**Status**: Draft  
**Input**: User description: "Promeni da se dohvatanje radi preko polymarket api-a i da se dohvataju samo basketball stvari, i za games i za props. I nista vise samo to, znaci samo basketball. Budi siguran da su svi podaci koji se dohvataju tacni nemoj ti izmisljati podatke. Ako treba restrukturiraj sve modele i apie sto do sad imas"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basketball Market Discovery (Priority: P1)

As a basketball informational user, I want to see a filtered list of only basketball prediction markets from Polymarket, including both game matchups and player props, so that I don't have to sift through unrelated political or entertainment markets.

**Why this priority**: Core focus of the application. The user explicitly requested "only basketball" and "nothing more."

**Independent Test**: Can be fully tested by verifying that 100% of the markets displayed in the explorer belong to basketball leagues (NBA, EuroLeague, NCAA, etc.) and no non-basketball markets are visible.

**Acceptance Scenarios**:

1. **Given** the user is on the explorer page, **When** the page loads, **Then** only markets categorized as "Basketball" or containing basketball keywords are fetched from the Polymarket API and displayed.
2. **Given** active basketball games and player props, **When** the user toggles between "Games" and "Props", **Then** the list updates to show only the relevant basketball sub-category.

---

### User Story 2 - Accurate Matchup Data (Priority: P2)

As an analytical user, I want to see verified betting metrics (Moneyline, Spread, Total) and player prop odds directly from the source so that I can trust the data being used for AI analysis.

**Why this priority**: Essential for the system's credibility. The user emphasized "be sure that all data fetched is accurate, do not invent data."

**Independent Test**: Compare the odds and market titles displayed in the application with the live data on Polymarket.com for the same market ID.

**Acceptance Scenarios**:

1. **Given** a specific basketball game, **When** the data is fetched via the Polymarket API, **Then** the Moneyline, Spread, and Total odds must match the current outcome prices on Polymarket exactly.
2. **Given** a player prop, **When** viewed in the app, **Then** the "Yes/No" outcomes and their prices are rendered accurately based on the API response.

---

### User Story 3 - Specialized Basketball Analysis (Priority: P3)

As a sports enthusiast, I want to trigger an AI analysis that specifically considers basketball-related metrics (e.g., team form, injuries, player stats) for the markets I find, so that I get insights tailored to the sport.

**Why this priority**: Provides the "AI-powered" value proposition while staying within the "basketball-only" constraint.

**Independent Test**: Trigger an analysis for a game and verify the "Analyst Report" references basketball-specific context (e.g., "three-point shooting", "post-play", "defensive rating") and not generic betting advice.

**Acceptance Scenarios**:

1. **Given** a basketball matchup, **When** "Analyze Matchup" is clicked, **Then** the AI analyst generates a report using accurate, non-fictional team statistics and market data.

---

## Edge Cases

- **Market Category Ambiguity**: How does the system handle markets that aren't tagged "Basketball" but involve basketball teams? (Strategy: Keyword filtering on question and title).
- **Stale Odds**: What happens if the Polymarket API returns prices that shift significantly during the analysis? (Strategy: Snapshot data at time of analysis and show "Last Updated" timestamp).
- **Incomplete Props**: How does the system handle props with more than two outcomes (e.g., "Who scores most points?")? (Constraint: MVP focuses on binary Yes/No props or standard matchups).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST exclusively fetch data from the Polymarket Gamma REST API (free endpoints).
- **FR-002**: System MUST implement a robust basketball filter that screens markets by `category`, `groupItemTitle`, and `question` keywords.
- **FR-003**: System MUST support the aggregation of multiple Polymarket IDs (ML, Spread, Total) into a single "Matchup" entity for the dashboard.
- **FR-004**: System MUST differentiate between "Game" markets (timely matchups) and "Prop" markets (player/event specific) within the basketball category.
- **FR-005**: All analysis reports MUST be grounded in verified market data and external basketball stats; hallucinatory or "invented" data is strictly prohibited.
- **FR-006**: Models and API endpoints MUST be refactored to prioritize the structure returned by the Polymarket REST API.

### Key Entities *(include if feature involves data)*

- **Market (Polymarket)**: The raw data point from the API (id, question, category, outcomePrices, outcomes, volume).
- **Matchup (Aggregated)**: A collection of Markets representing a single basketball game (Home Team, Away Team, Kickoff, ML Market, Spread Market, Total Market).
- **Prop (Individual)**: A single basketball market representing a specific event or player statistic.
- **Analysis**: The persisted result of AI reasoning based on a specific Market snapshot.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of markets displayed in the system are verified basketball markets.
- **SC-002**: Data synchronization between the app and Polymarket API occurs in under 1 second.
- **SC-003**: 0% incidence of "invented" or "place-holder" data in analysis reports (verified via test audits).
- **SC-004**: Users can successfully filter between "Games" and "Props" sections with 100% accuracy.
- **SC-005**: API response time for the aggregated basketball dashboard is under 300ms.

## Assumptions

- The Polymarket Gamma API remains free and accessible for the basketball category.
- Basketball-related markets can be reliably identified by filtering for "NBA", "EuroLeague", "NCAA", "Basketball", and "WNBA".
- The AI LLM has access to recent basketball context (via RAG or fresh data injection) to ensure analysis accuracy.
