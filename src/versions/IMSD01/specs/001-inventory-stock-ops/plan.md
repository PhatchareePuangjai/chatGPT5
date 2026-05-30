# Implementation Plan: Inventory Stock Operations

**Branch**: `001-inventory-stock-ops` | **Date**: 2026-05-30 | **Spec**: `specs/001-inventory-stock-ops/spec.md`

**Input**: Feature specification from `specs/001-inventory-stock-ops/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement core inventory stock mutations with correctness under concurrency:

- Deduct stock on successful purchase with an audit trail (`InventoryLog`).
- Restore stock on order cancel/expire with an audit trail.
- Create low-stock alerts when quantity becomes <= threshold.
- Ensure atomicity (stock + log + alert), oversell prevention, and safe concurrent behavior.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js LTS)

**Primary Dependencies**: Express (API), React 18.3.1 (UI), `pg` (PostgreSQL client)

**Storage**: PostgreSQL

**Testing**: Backend integration tests with Supertest; unit tests for services; frontend behavior
tests with React Testing Library

**Target Platform**: Web application (server + browser clients)

**Project Type**: Web app (backend API + frontend UI)

**Performance Goals**: Inventory mutations stay responsive under modest concurrency (e.g., 5-way
race tests) with predictable latency for the user.

**Constraints**: Correctness over throughput for stock mutation paths; no negative inventory; log
always matches mutations; no external I/O inside DB transactions.

**Scale/Scope**: 3 user stories from spec; minimal admin UI for viewing stock + alerts is in-scope
for React alignment.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derived from `./.specify/memory/constitution.md`:

- Code quality: clear boundaries (routes -> services -> DB), boring dependencies, no raw string SQL.
- Testing: unit tests for business logic plus API integration tests; deterministic tests; regression
  tests for bugs.
- UX/accessibility: reusable components, accessible forms/controls, consistent validation UX.
- Performance: avoid N+1 queries; indexed lookups; no avoidable frontend bloat.
- Reliability/observability: consistent error bodies, structured logs, request id propagation.

Result: PASS (no known violations required for this feature).

## Project Structure

### Documentation (this feature)

```text
specs/001-inventory-stock-ops/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
│   └── db/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web app layout (`backend/` + `frontend/`) because the stack explicitly
includes React and the feature benefits from an admin view for stock + low-stock alerts.
