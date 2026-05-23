# Implementation Plan: Inventory Stock Operations

**Branch**: `001-scenarios-spec` | **Date**: 2026-05-23 | **Spec**: `specs/001-scenarios-spec/spec.md`

**Input**: Feature specification from `/specs/001-scenarios-spec/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement inventory stock operations that remain correct under concurrency:
stock deduction on confirmed purchase, stock restoration on cancel/expire, low-stock alerts on
threshold, and strict audit logging for every successful inventory change.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js (LTS, 20+) + TypeScript

**Primary Dependencies**: Express (backend), React `^18.3.1` (frontend)

**Storage**: PostgreSQL

**Testing**: Backend: Vitest + Supertest; Frontend: Vitest + React Testing Library; E2E: Playwright

**Target Platform**: Web application (API + browser UI)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: Inventory updates and reads feel instant for an admin user; reject oversell attempts quickly

**Constraints**: Inventory correctness under concurrency; no negative stock; audit log must always match inventory changes

**Scale/Scope**: Single bounded domain (inventory operations + alerts); designed to be safely extensible

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derived from `.specify/memory/constitution.md` (must pass before Phase 0 and re-check after design):

- Code quality: changes are small, readable, and follow consistent patterns (no drive-by refactors).
- Testing: every meaningful behavior change has automated tests (unit/integration; add E2E for critical flows).
- UX consistency: shared components/patterns are reused; loading/empty/error states exist and are coherent.
- Performance: defend query patterns; add measurement notes for changes that affect latency/payload/CPU/memory.
- Operability: structured logs without sensitive data; migrations are safe; errors are explicit and consistent.

Gate evaluation (pre-design): PASS (no violations required for planning).

## Project Structure

### Documentation (this feature)

```text
specs/001-scenarios-spec/
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

**Structure Decision**: Use a two-project web app layout (`backend/` + `frontend/`) to keep UI and API concerns separated while allowing independent test suites.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
