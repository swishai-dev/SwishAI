# Implementation Plan: Basketball AI Prediction Agent

**Branch**: `001-basketball-prediction-ai` | **Date**: 2026-01-17 | **Spec**: [specs/001-basketball-prediction-ai/spec.md](spec.md)
**Input**: Feature specification for an AI-powered basketball prediction market system. Recreating the Polymarket "Sports Dashboard" UI style for Games and a specialized layout for Props.

## Summary

Build a specialized AI agent for analyzing basketball prediction markets on Polymarket. The system features a Next.js App Router backend for data ingestion (Polymarket + Basketball stats) and a premium frontend utilizing GSAP, Framer Motion, and Three.js. The UI distinguishes between "Games" (matchups with ML, Spread, Total) and "Props" (player performance, specific events) with tailored layouts for each.

## Technical Context

**Language/Version**: TypeScript / Next.js 14+ (App Router)  
**Primary Dependencies**: Framer Motion, GSAP, Three.js, Prisma, OpenAI/Anthropic SDK  
**Data Sources**: Polymarket Gamma API (Markets, Prices, Volume), Basketball Stats API (Team Records, Injuries, Player Stats)  
**Storage**: PostgreSQL (Analyses, Teams, Matchups)  
**Testing**: Vitest (Unit), Playwright (E2E for animations)  
**Target Platform**: Web (Desktop & Mobile Responsive)
**Project Type**: Next.js Fullstack Application  
**Performance Goals**: <3s Initial Load, 60fps Animations, <200ms API p95  
**Constraints**: strictly analytical (no betting), informational-only design  
**Scale/Scope**: NBA, EuroLeague, NCAA, Int'l Competitions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality**: ✓ Feature design follows single-responsibility principle and maintains code quality standards

**Testing Standards**: ✓ Test strategy defined (unit, integration, E2E) with coverage targets (80%+); TDD approach documented

**User Experience Consistency**: ✓ UX patterns align with Polymarket Dashboard style; distinct layouts for Games and Props sections

**Performance Requirements**: ✓ Performance targets defined (page load <3s, TTI <5s, API p95 <200ms); optimization strategy planned

**Technology Stack**: ✓ Next.js App Router used; dependencies justified and minimal; no unnecessary libraries

**File Structure**: ✓ Project structure follows Next.js conventions; files organized by domain/functionality

**Responsive Design**: ✓ Mobile and desktop support planned; responsive breakpoints defined; cross-device testing strategy

## Project Structure

### Documentation (this feature)

```text
specs/001-basketball-prediction-ai/
├── plan.md              # This file
├── research.md          # Phase 0: Technical approach & Dashboard UI decisions
├── data-model.md        # Phase 1: Database schema (with Volume & Records)
├── quickstart.md        # Phase 1: Local setup guide
├── contracts/           # Phase 1: API definitions (Dashboard-ready)
│   └── api.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
# Next.js fullstack application
app/
├── api/
│   ├── markets/         # Polymarket ingestion (Games vs Props logic)
│   └── analysis/        # AI Inference & Cache lookup
├── explorer/            # Market explorer page (Games/Props toggle)
├── matchup/[id]/        # Analysis & Reveal page
└── layout.tsx           # Root layout with Glassmorphism styles

components/
├── analysis/            # AI reveal components (GSAP sequences)
├── explorer/            # MarketRows (Games), PropCards (Props), BettingGrid
├── ui/                  # Neon accents, Glass panels, Pagination
└── shared/              # 3D Basketball Hero (Three.js)

lib/
├── ai/                  # LLM Analyst logic
├── data/                # Polymarket REST & Sports API clients
└── utils/               # Animation helpers (GSAP timelines)

types/                   # Prisma-generated & custom types
hooks/                   # useSimulatedInference, useOddsStream
styles/                  # Tailwind + Global Neon themes
```

**Structure Decision**: Next.js App Router with domain-driven component organization. UI follows the "Polymarket Dashboard" pattern for sports data, ensuring parity with time, volume, team records, and market grids for Games, and a specialized Prop list for Props.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Three.js for Hero | Immersive high-end aesthetic | Video/Static image lacks interactivity for probability visuals |
| GSAP for Reveal | Precise timing control for multi-stage reveal | Framer Motion is less suited for complex sequential timelines |
| Simulated Latency | UX consistency between cache/fresh | Immediate cache return feels "broken" compared to the AI journey |
| Dashboard Rebuild | Parity with reference image | Standard grid cards feel less "professional" for sports betting markets |
| Data Aggregation | Combine ML, Spread, Total per row | Separate cards make comparison difficult and break Dashboard aesthetic |
| Section Toggle | Distinct Games vs Props experience | A single list makes it hard for users to distinguish between game markets and player props |
