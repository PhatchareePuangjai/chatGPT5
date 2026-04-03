<!-- SYNC IMPACT REPORT
Version change: UNVERSIONED → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles (4 principles: Code Quality, Testing Standards, UX Consistency, Performance)
  - Quality Gates
  - Development Workflow
  - Governance
Removed sections: N/A (initial — 5th principle slot intentionally unused;
  project requires exactly 4 principle areas as specified by user)
Templates reviewed:
  - .specify/templates/plan-template.md ✅ aligned (Constitution Check gate references these principles)
  - .specify/templates/spec-template.md ✅ aligned (User Scenarios + Edge Cases match testing standards)
  - .specify/templates/tasks-template.md ✅ aligned (test-first task ordering matches Principle II)
  - .specify/templates/checklist-template.md ✅ no constitution-specific changes required
Follow-up TODOs: None
-->

# Inventory Management System Constitution

## Core Principles

### I. Code Quality & Maintainability
Business logic MUST reside in the service layer; controllers and models MUST not contain domain
rules. Code MUST maintain clear separation of concerns across models, services, and API layers.
All public interfaces MUST be self-documenting with precise naming; inline comments MUST explain
"why," never "what." Dead code, commented-out blocks, and unused imports MUST not be committed.
Cyclomatic complexity per function MUST stay ≤ 10; complex logic MUST be extracted and named.
**Rationale**: Decoupled, readable code reduces defect surface during feature changes and review.

### II. Testing Standards (NON-NEGOTIABLE)
Tests MUST be written and confirmed to fail before any implementation begins (TDD).
Every acceptance scenario and edge case defined in scenario documents (e.g., `scenarios_inventory.md`)
MUST have a corresponding automated test. Required test categories for all stock-mutation features:
- **Unit**: service-layer logic in isolation (validation, threshold comparisons, log record creation).
- **Integration**: transaction atomicity — simulate log-write failure and assert full rollback.
- **Concurrency**: fire ≥ 5 simultaneous requests against single-item stock; assert exactly 1
  success, N-1 `Insufficient Stock` errors, and final stock = 0 (never negative).
- **Boundary Value**: test threshold values at n+1, n, and n-1 for every numeric rule.
`<` vs `<=` operator mismatches in threshold logic are treated as P1 defects.
**Rationale**: Test-first enforces spec fidelity; boundary tests prevent silent off-by-one failures.

### III. User Experience Consistency
All API responses MUST conform to a uniform envelope structure:
`{ "status": "success" | "error", "data": <payload | null>, "error": <message | null> }`.
Error messages MUST be human-readable, specific, and actionable (e.g., "Insufficient stock:
requested 6, available 5") — generic messages such as "An error occurred" are not acceptable.
Stock state MUST reflect the latest committed transaction immediately upon response; stale reads
following a successful write are treated as defects. HTTP status codes MUST accurately reflect
outcomes: 200 success, 400 validation failure, 409 conflict (e.g., concurrent oversell).
**Rationale**: Consistent response shapes reduce client-side defensive code and ease debugging.

### IV. Performance Requirements
Stock deduction and lookup operations MUST complete within 200ms at p95 under expected load.
Database transactions MUST be short-lived: no external I/O, user interaction, or heavy computation
MUST occur inside an open transaction block. Locking strategies (e.g., `SELECT ... FOR UPDATE`)
MUST be documented per operation; lock acquisition order MUST be consistent across all code paths
to prevent deadlocks. Query plans for high-frequency stock reads MUST use indexed lookups.
**Rationale**: Inventory operations are in the critical purchase path; latency and deadlocks
directly impact conversion and system availability.

## Quality Gates

The following gates MUST pass before a feature branch is merged:
- All acceptance scenario tests pass (unit, integration, concurrency, boundary value).
- No new cyclomatic complexity violations (> 10 per function) introduced.
- API response shapes validated against the uniform envelope contract.
- p95 latency benchmark ≤ 200ms confirmed under simulated concurrent load.
- Zero dead code, unused imports, or commented-out blocks in changed files.

## Development Workflow

- Implementation MUST NOT begin until corresponding tests are written and confirmed failing.
- The Constitution Check gate in `plan-template.md` MUST be evaluated before Phase 0 research
  and re-evaluated after Phase 1 design.
- All PRs MUST include evidence of passing all four test categories listed in Principle II.
- Performance benchmark results MUST be included in the PR description for stock-mutation features.
- Complexity violations (e.g., additional layers, extra abstractions) MUST be justified in the
  Complexity Tracking section of `plan.md`.

## Governance

This constitution supersedes all other development practices and guidelines for this project.
Amendments MUST include a version bump, written rationale, and a migration note for affected
features. All code reviews MUST verify compliance with Principles I–IV above.
Version increments follow semantic versioning:
- MAJOR: principle removal, redefinition, or backward-incompatible governance change.
- MINOR: new principle or section addition, material expansion of guidance.
- PATCH: clarifications, wording fixes, non-semantic refinements.

**Version**: 1.0.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-04-02
