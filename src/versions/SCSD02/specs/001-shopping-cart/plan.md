# Implementation Plan: Shopping Cart Core Behaviors

**Branch**: `001-shopping-cart` | **Date**: 2026-05-24 | **Spec**: specs/001-shopping-cart/spec.md

**Input**: Feature specification from `specs/001-shopping-cart/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement core shopping cart behaviors:

- Update item quantity with immediate, correct totals.
- Merge duplicate add-to-cart into an existing cart line.
- Save active cart items for later (excluded from totals).
- Enforce stock limits and correct money precision (2 decimals, no float artifacts).

## Technical Context

**Language/Version**: Node.js (LTS), TypeScript (preferred) for backend and frontend, React 18.3.1+

**Primary Dependencies**:

- Backend: Express (HTTP API), validation library (TBD), structured logging (TBD)
- Frontend: React 18.3.1+, state management (TBD), component library/design system (TBD)

**Storage**: PostgreSQL (persistent cart storage and product inventory/stock)

**Testing**:

- Backend: unit + integration tests (framework TBD: Jest or Vitest)
- Frontend: component/unit tests (framework TBD) plus optional E2E tests later

**Target Platform**: Web application (browser + HTTP API)

**Project Type**: Web app (frontend + backend) with shared domain logic where appropriate

**Performance Goals**:

- Cart totals update perceived by users within 1 second of action completion (per spec SC-001)
- API operations for cart updates target <200ms p95 at the service boundary (informational goal)

**Constraints**:

- Currency precision correctness: 2 decimal places, no float artifacts (spec Edge Case)
- Stock checks must include existing cart quantity in validation

**Scale/Scope**:

- Scope is limited to the cart operations defined in the spec (no discounts, taxes, shipping, coupons)
- Single currency per cart session (assumption)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derived from `.specify/memory/constitution.md`:

- Code quality: consistent lint/formatting; TypeScript preferred unless justified.
- Testing standards: acceptance scenarios must map to automated tests; integration tests for key flows.
- UX consistency: reuse patterns; consistent loading/error/empty states; accessible interactions.
- Performance & reliability: measurable performance goals; DB indexes/pagination considered; fail gracefully.
- Security & data integrity: validate inputs at boundaries; enforce authz server-side; migrations repeatable.

Result: PASS (no exceptions requested).

## Project Structure

### Documentation (this feature)

```text
specs/001-shopping-cart/
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
│   ├── api/             # Express routes/controllers
│   ├── domain/          # cart math + stock rules (testable)
│   ├── db/              # queries/repos, migrations
│   ├── middleware/      # auth, validation, error handling
│   └── services/        # orchestration (cart service)
└── tests/               # unit + integration

frontend/
├── src/
│   ├── components/      # cart line items, totals, saved items list
│   ├── pages/           # cart page/screen
│   ├── services/        # API client
│   └── state/           # cart state management
└── tests/               # unit/component tests
```

**Structure Decision**: Web application structure (`backend/` + `frontend/`) to keep UI and API
concerns isolated while sharing a clear cart domain model per layer.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
