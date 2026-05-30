<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - I. Code Quality & Maintainability -> I. Code Quality Is a Product Requirement
  - II. Testing Standards (NON-NEGOTIABLE) -> II. Testing Is Non-Negotiable
  - III. User Experience Consistency -> III. UX Consistency and Accessibility
  - IV. Performance Requirements -> IV. Performance Budgets and Guardrails
- Added sections:
  - Principle V. Reliability Through Explicit Errors and Observability
  - Technology Stack & Non-Negotiables
  - Workflow & Quality Gates
- Removed sections: N/A
- Templates requiring updates:
  - ✅ .specify/templates/tasks-template.md (tests guidance aligned with constitution)
  - ✅ .specify/templates/plan-template.md (reviewed; no changes required)
  - ✅ .specify/templates/spec-template.md (reviewed; no changes required)
- Deferred items: N/A
-->

# Inventory Management System Constitution

## Core Principles

### I. Code Quality Is a Product Requirement
Code MUST be readable, maintainable, and safe to change.

- New code MUST follow established repo patterns (folder structure, naming, error handling).
- Public module boundaries (API routes, service interfaces, React components) MUST have clear contracts.
- No “clever” implementations: prefer straightforward control flow and boring dependencies.
- Lint/format MUST run in CI and MUST be clean before merge.
- Database access MUST be parameterized and structured; raw string-concatenated SQL is forbidden.

### II. Testing Is Non-Negotiable
Every change MUST be protected by tests at the right level.

- Each user story MUST have at least one integration-level “happy path” test (API or UI flow).
- Backend MUST have unit tests for non-trivial business logic, plus API/route integration tests.
- Frontend MUST have component/behavior tests for user-visible logic (React Testing Library style).
- Bugs MUST ship with a regression test.
- Tests MUST be deterministic: no timeouts-as-assertions; control time and randomness in tests.

### III. UX Consistency and Accessibility
The UI MUST feel like one product and remain accessible by default.

- UI MUST reuse shared components and patterns; avoid one-off UI implementations.
- New UI components MUST be keyboard navigable and have accessible names/labels.
- Forms MUST have explicit validation UX (inline messages, focus management on submit errors).
- Visual consistency rules (spacing, typography, colors) MUST be enforced via shared tokens/styles.

### IV. Performance Budgets and Guardrails
Performance MUST be designed, measured, and defended.

- Backend endpoints MUST have explicit performance expectations; changes that regress p95 latency
  MUST be investigated before merge.
- Database access MUST avoid N+1 query patterns; new endpoints MUST justify query shape and
  include indexes/migrations as needed.
- Frontend MUST avoid avoidable re-renders and large client bundles; new heavy dependencies MUST
  be justified and measured (bundle impact).

### V. Reliability Through Explicit Errors and Observability
Failures MUST be debuggable and safe.

- API errors MUST be consistent and structured (status codes + error bodies with stable fields).
- Logging MUST be structured and must not leak secrets/credentials/PII.
- Every request MUST have a correlation/request id (propagate through logs).
- Any async/background work MUST be idempotent or have clear retry semantics.

## Technology Stack & Non-Negotiables

Stack:

- Backend: Node.js + Express
- Frontend: React `^18.3.1`
- Database: PostgreSQL

Non-negotiables:

- Use environment-based configuration; no committed secrets.
- Validate all external inputs at the boundary (API handlers, form submits).
- All DB schema changes MUST go through migrations and be reversible when practical.
- Prefer TypeScript for new backend/frontend code; exceptions require explicit justification
  (small scripts, vendor constraints).

## Workflow & Quality Gates

Quality gates for merge:

- CI MUST be green (lint/format, unit tests, integration tests).
- PRs MUST describe the user-visible outcome and include a test plan.
- Any API contract change MUST include updated contract docs/tests where applicable.
- Performance-sensitive changes MUST include measurement evidence (before/after where relevant).

Definition of done (feature-level):

- User stories meet acceptance scenarios from `spec.md`.
- Tests cover the intended behavior and critical edge cases.
- Logging/error-handling is consistent with this constitution.
- UX is consistent (shared components, accessibility, validation behaviors).

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution governs feature specs, plans, tasks, and code changes in this repository.

Amendments:

- Amendments MUST be made via PR with rationale and examples of what changes in practice.
- Versioning uses SemVer:
  - MAJOR: removes/weakens a non-negotiable requirement or changes governance semantics
  - MINOR: adds a new principle/section or materially strengthens requirements
  - PATCH: clarifies wording without changing requirements
- Every PR review MUST include an explicit constitution compliance check.

**Version**: 1.1.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-05-30
