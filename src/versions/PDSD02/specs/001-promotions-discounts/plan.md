# Implementation Plan: Promotions and Discounts

**Branch**: `001-promotions-spec` | **Date**: 2026-05-29 | **Spec**: `specs/001-promotions-discounts/spec.md`

**Input**: Feature specification from `specs/001-promotions-discounts/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a promotions/discounts capability that correctly applies coupons and cart-level promotions during
checkout, enforcing validity rules (min spend, expiry, per-user usage limits), deterministic calculation
order (percent first, then fixed), clear discount line items, and safeguards preventing negative totals.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**:
- Backend: Node.js (LTS) + TypeScript
- Frontend: TypeScript (React 18)

**Primary Dependencies**:
- Backend: Express (HTTP API), schema validation library (decision in research)
- Frontend: React `^18.3.1`, React Router (if needed), UI component baseline (decision in research)

**Storage**: PostgreSQL (migrations required)

**Testing**:
- Backend: unit tests (promotion engine) + integration tests (HTTP + DB)
- Frontend: component tests for coupon UX + journey tests for checkout totals

**Target Platform**: Web (browser) + server (Linux)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Backend: p95 < 300ms for totals computation for typical carts
- Frontend: totals update visible within 2s for typical carts

**Constraints**:
- Money calculations must be deterministic and safe (no floating-point drift)
- Totals must never be negative
- Coupon usage limit must be enforced per-user across orders

**Scale/Scope**: Initial scope limited to:
- Apply a single coupon per order (assumption from spec)
- Cart-level percentage promotions
- Deterministic discount order and display

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Tests are mandatory for behavior changes (unit + integration).
- UX must include clear success/error messaging and discount line item visibility.
- Accessibility must be considered (keyboard + labeling for coupon input and feedback).
- Performance targets must be defined and validated (backend p95 + frontend responsiveness).
- PostgreSQL changes must use migrations and enforce invariants with constraints where applicable.

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

**Structure Decision**: Web application layout with `backend/` and `frontend/` to keep API/business logic
and UI concerns separate and testable.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
