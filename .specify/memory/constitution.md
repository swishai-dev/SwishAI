<!--
Sync Impact Report:
Version change: N/A → 1.0.0 (initial constitution)
Modified principles: N/A (all new)
Added sections:
  - Core Principles (Code Quality, Testing Standards, UX Consistency, Performance)
  - Technology Stack & Dependencies
  - File Structure Standards
  - Responsive Design Requirements
  - Development Workflow
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Updated Constitution Check section
  ✅ spec-template.md - No changes needed (already supports all requirements)
  ✅ tasks-template.md - No changes needed (already supports testing standards)
  ✅ checklist-template.md - No changes needed
Follow-up TODOs: None
-->

# SwishAi Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All code MUST adhere to strict quality standards. Code MUST be readable, maintainable, and follow consistent patterns. Functions and components MUST be single-purpose and well-documented. Code reviews MUST verify adherence to quality standards before merge. Refactoring is mandatory when technical debt accumulates beyond acceptable thresholds.

**Rationale**: High code quality reduces bugs, improves maintainability, and accelerates development velocity. It ensures long-term project sustainability and reduces onboarding time for new developers.

### II. Testing Standards (NON-NEGOTIABLE)

All features MUST include comprehensive test coverage. Unit tests MUST cover business logic and utility functions. Integration tests MUST verify API endpoints and data flows. End-to-end tests MUST validate critical user journeys. Tests MUST be written before or alongside implementation (TDD preferred). Test coverage MUST meet minimum thresholds (80%+ for critical paths). All tests MUST pass before code can be merged.

**Rationale**: Comprehensive testing prevents regressions, enables confident refactoring, and serves as living documentation. It reduces production bugs and deployment risks.

### III. User Experience Consistency

All user-facing features MUST provide consistent experiences across the application. Design patterns, interaction models, and visual elements MUST follow established design system guidelines. Navigation and information architecture MUST be intuitive and predictable. Error messages and feedback MUST be clear, actionable, and consistent in tone. Accessibility standards (WCAG 2.1 AA minimum) MUST be met.

**Rationale**: Consistent UX reduces cognitive load, improves usability, and builds user trust. It enables users to transfer knowledge between features and reduces support burden.

### IV. Performance Requirements

All features MUST meet defined performance benchmarks. Page load times MUST be under 3 seconds on 3G connections. Time to Interactive (TTI) MUST be under 5 seconds. API response times MUST be under 200ms for p95. Database queries MUST be optimized and indexed appropriately. Images and assets MUST be optimized and lazy-loaded. Code splitting MUST be implemented to minimize initial bundle size.

**Rationale**: Performance directly impacts user satisfaction, conversion rates, and SEO rankings. Poor performance leads to user abandonment and increased infrastructure costs.

## Technology Stack & Dependencies

### Next.js Fullstack Framework

The application MUST use Next.js as the primary fullstack framework. Next.js provides server-side rendering, API routes, and optimized production builds. App Router architecture MUST be used for new features. Server Components MUST be preferred over Client Components unless interactivity is required.

**Rationale**: Next.js provides a unified framework for both frontend and backend, reducing complexity and enabling optimal performance through SSR and static generation.

### Minimal Dependencies

Only necessary libraries MUST be included. Each dependency MUST be justified with a clear use case. Before adding a new dependency, existing solutions and built-in capabilities MUST be evaluated. Dependencies MUST be actively maintained and have acceptable security postures. Bundle size impact MUST be considered for client-side dependencies.

**Rationale**: Minimal dependencies reduce security vulnerabilities, decrease bundle size, improve build times, and simplify maintenance. It prevents dependency bloat and version conflicts.

## File Structure Standards

### Organized Project Structure

The codebase MUST follow a clear, logical file structure. Features MUST be organized by domain/functionality, not by technical layer. Shared components and utilities MUST be placed in appropriate common directories. File and directory names MUST be descriptive and follow consistent naming conventions (kebab-case for files, PascalCase for components). Related files MUST be co-located when it improves discoverability.

**Rationale**: Well-organized structure improves code discoverability, reduces cognitive overhead, and enables efficient navigation. It supports team collaboration and scales with project growth.

### Next.js Structure Guidelines

- `app/` directory MUST contain route definitions and page components
- `components/` MUST contain reusable UI components organized by feature or type
- `lib/` MUST contain utility functions and shared business logic
- `types/` MUST contain TypeScript type definitions
- `hooks/` MUST contain custom React hooks
- `styles/` MUST contain global styles and theme definitions
- API routes MUST be in `app/api/` following RESTful conventions

## Responsive Design Requirements

### Mobile and Desktop Support

All features MUST be fully functional and optimized for both mobile and desktop devices. Responsive design MUST use mobile-first approach. Breakpoints MUST be consistent across the application. Touch targets MUST be at least 44x44px on mobile. Layouts MUST adapt gracefully to different screen sizes without horizontal scrolling. Critical functionality MUST be accessible without requiring desktop-specific interactions.

**Rationale**: Users access applications from diverse devices. Mobile-first design ensures accessibility for the largest user base while maintaining excellent desktop experiences.

### Cross-Device Testing

Features MUST be tested on both mobile and desktop viewports before deployment. Browser compatibility MUST be verified for target browsers. Performance MUST be validated on representative devices and network conditions.

## Development Workflow

### Code Review Process

All code changes MUST be reviewed by at least one other developer. Reviews MUST verify constitution compliance, test coverage, and code quality. Reviews MUST check for performance implications and accessibility concerns. Reviews MUST validate responsive design implementation.

### Quality Gates

Before merge, code MUST pass:
- All automated tests
- Linting and formatting checks
- Type checking (TypeScript)
- Performance budgets (if defined)
- Accessibility audits (automated)

## Governance

This constitution supersedes all other development practices and guidelines. All team members MUST comply with these principles. Amendments to this constitution require:

1. Documentation of the proposed change and rationale
2. Review and approval by the project maintainers
3. Update to version number following semantic versioning:
   - **MAJOR**: Backward incompatible changes, principle removals, or fundamental redefinitions
   - **MINOR**: New principles added or existing principles materially expanded
   - **PATCH**: Clarifications, wording improvements, or non-semantic refinements
4. Propagation of changes to dependent templates and documentation
5. Communication to all team members

All pull requests and code reviews MUST verify compliance with this constitution. Complexity or deviations from principles MUST be explicitly justified and documented. Use feature specifications and implementation plans for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-01-17 | **Last Amended**: 2026-01-17
