# Research: Inventory Stock Operations

**Date**: 2026-05-23
**Spec**: `specs/001-scenarios-spec/spec.md`

## Decisions

### Decision: TypeScript for backend and frontend
**Rationale**: Improves correctness of data shapes across API, services, and UI; reduces regressions.
**Alternatives considered**: JavaScript-only (faster to start, less type safety).

### Decision: PostgreSQL row-level locking for concurrency safety
**Rationale**: The spec requires correctness under concurrency and "never negative stock".
Row-level locking during stock updates ensures only one concurrent update can claim the last unit.
**Alternatives considered**: Application-level mutexes (hard to scale), optimistic retries only (riskier to reason about).

### Decision: Use explicit transactions for inventory update + audit log
**Rationale**: Spec requires "all-or-nothing" updates (no stock change without a matching audit record).
**Alternatives considered**: Best-effort audit logging (violates FR-007).

### Decision: Minimal REST-style API contracts
**Rationale**: Enables deterministic integration tests and an explicit boundary for validation and errors.
**Alternatives considered**: RPC-style endpoints (fine, but REST is simpler and more familiar).

### Decision: Test stack and layering
**Rationale**: Constitution requires tests by default and determinism.
- Backend unit tests for business rules, integration tests for HTTP + DB behavior.
- Frontend component tests for interaction states; E2E tests for the critical stock mutation flow.
**Alternatives considered**: E2E-only (slow/flaky), unit-only (misses concurrency and DB behavior).

## Open Questions (Resolved by Defaults)

- Node.js version: default to current LTS (20+).
- Migrations tooling: choose one consistent approach; keep SQL-first to avoid hidden behavior.

## Notes

This research intentionally avoids premature choices (ORM vs query builder) beyond what is needed
to enforce correctness constraints from the spec (transactions + locking) and the constitution.
