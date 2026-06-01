# Implementation Plan: Shopping Cart Core Behaviors

**Branch**: `001-shopping-cart` | **Date**: 2026-06-01 | **Spec**: specs/001-shopping-cart/spec.md

**Input**: Feature specification from `specs/001-shopping-cart/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement core shopping cart behaviors:
- Update item quantity with immediate, correct totals
- Merge duplicate add-to-cart operations for same SKU (no duplicate rows) with stock enforcement
- Save for later (move from Active to Saved and exclude from checkout totals)

This plan targets a typical web application split into backend + frontend, using
PostgreSQL for persistence and money-safe arithmetic (no floating point artifacts).

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js (LTS), JavaScript or TypeScript

**Primary Dependencies**:
- Backend: Express
- Frontend: React 18.3.1

**Storage**: PostgreSQL

**Testing**:
- Backend: unit tests (domain/services) + integration tests (HTTP + DB)
- Frontend: component/integration tests for user flows and state transitions

**Target Platform**: Web application (browser frontend + server backend)

**Project Type**: Web app (frontend + backend)

**Performance Goals**:
- Cart operations feel immediate for users in typical conditions
- Prevent obvious DB/query pathologies on common cart mutations

**Constraints**:
- No floating point artifacts in displayed prices/totals
- Cart mutations are atomic from a user perspective (either applied or rejected with state preserved)

**Scale/Scope**:
- Scope limited to cart core behaviors; excludes tax/shipping/promotions/auth (per spec assumptions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

These gates are derived from `.specify/memory/constitution.md` and MUST be
explicitly checked in the plan.

- **Code quality**: lint/format gates defined; error handling approach documented.
- **Testing**: test strategy defined for backend (unit + integration) and frontend
  (component/integration); CI commands identified.
- **UX consistency**: shared UI patterns/components identified; loading/empty/error
  states accounted for; accessibility considerations listed.
- **Performance**: any performance budgets/targets stated; measurement plan stated;
  likely DB/query risks identified.
- **Observability**: logging/error reporting/metrics approach noted (at minimum how
  we will debug failures and identify slow paths).

Gate evaluation (initial):
- Code quality: PASS (no implementation yet; plan includes lint/test gates in tasks)
- Testing: PASS (tests required by constitution; planned as part of implementation)
- UX consistency: PASS (UI contracts include loading/empty/error state expectations)
- Performance: PASS (money-safe arithmetic + DB/index notes captured)
- Observability: PASS (backend logging + request correlation planned)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web application split into `backend/` and `frontend/`.
This aligns with the stack (Express + React) and supports independent test suites.

## Phase Outputs

Phase 0 (Research): `specs/001-shopping-cart/research.md`  
Phase 1 (Design): `specs/001-shopping-cart/data-model.md`, `specs/001-shopping-cart/contracts/`, `specs/001-shopping-cart/quickstart.md`

Constitution re-check (post-design): PASS

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
