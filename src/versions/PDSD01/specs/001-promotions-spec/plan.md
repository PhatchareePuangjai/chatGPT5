# Implementation Plan: Promotions and Discounts

**Branch**: `001-promotions-spec` | **Date**: 2026-04-03 | **Spec**: [spec.md](/Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/PDSD01/specs/001-promotions-spec/spec.md)
**Input**: Feature specification from `/specs/001-promotions-spec/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a promotions and discounts capability that validates coupons, applies
percentage and fixed discounts in the correct order, enforces usage limits and
expiration rules, and guarantees non-negative totals with clear messaging and
line-item transparency across backend and frontend checkout views.

## Technical Context

**Language/Version**: Backend: Python 3.11 (assumed default for this repo). Frontend: TypeScript (assumed)  
**Primary Dependencies**: Backend: existing stack (assumed). Frontend: existing web app framework (assumed)  
**Storage**: Existing relational database for coupon definitions and usage history (assumed)  
**Testing**: Backend: pytest (assumed). Frontend: existing test runner (assumed)  
**Target Platform**: Web app (frontend) + Linux server (backend)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Pricing evaluation completes in under 200 ms p95 per checkout (assumed)  
**Constraints**: Must preserve deterministic order of operations; totals never below 0 THB  
**Scale/Scope**: Moderate traffic (up to 10k checkouts/day assumed); scope limited to cart-level promos and coupons

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality Bar**: Plan includes clear boundaries, documentation, and linting gates. **Status: Pass**
- **Testing Standards**: Unit + integration coverage for pricing logic and checkout flows required. **Status: Pass**
- **UX Consistency**: Error and success messaging and discount line items are specified. **Status: Pass**
- **Performance Budgets**: Budget defined for pricing evaluation. **Status: Pass**
- **Reviewable Change Quality**: Plan requires impact summaries and release notes. **Status: Pass**

## Project Structure

### Documentation (this feature)

```text
specs/001-promotions-spec/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── pricing/
└── tests/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web application split with pricing logic in
`backend/src/pricing/` and checkout UI in `frontend/src/` using shared service
calls to display line items and totals.

## Complexity Tracking

No constitution violations expected; no additional complexity justification needed.
