# Implementation Plan: Promotions & Discounts

**Branch**: `[001-promotions-discounts]` | **Date**: 2026-05-31 | **Spec**: `specs/001-promotions-discounts/spec.md`

**Input**: Feature specification from `specs/001-promotions-discounts/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a promotions-and-discounts pricing capability that:
- validates and applies coupon codes (min spend, expiration, per-user usage limit)
- applies cart-total percentage promotions
- enforces a deterministic discount stacking order
- guarantees non-negative grand totals

Approach:
- centralize all pricing math in a single pricing module/service
- store coupon definitions + redemption history for enforcement and audit
- expose a small API surface for “price preview” and “apply coupon”
- cover scenarios with unit + integration tests, including Postgres-backed usage limit checks

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js (LTS) + TypeScript

**Primary Dependencies**: Express (backend), React `^18.3.1` (frontend)

**Storage**: PostgreSQL

**Testing**: Backend unit + Postgres integration tests; frontend unit tests + E2E for critical flows

**Target Platform**: Web application (browser) + server API

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Checkout pricing updates feel “instant” for users; no visible UI jank during recalculation

**Constraints**: Deterministic pricing (no flakiness), no negative totals, and clear user-facing messages

**Scale/Scope**: Supports the scenarios in `scenarios_promotions.md` for a typical e-commerce checkout flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*Derived from `/.specify/memory/constitution.md`*

- **Code quality gate**: Pricing logic is centralized (no duplicated math across layers); clear error handling.
- **Testing gate (NON‑NEGOTIABLE)**: Add tests for each acceptance scenario + edge cases; deterministic tests.
- **UX/a11y gate**: Checkout shows an explicit discount line item and clear status messages; keyboard-friendly.
- **Performance gate**: Pricing recomputation is bounded and measurable; avoid N+1 queries for usage lookups.
- **Reliability/observability gate**: Validate inputs, store redemption history, and log pricing decisions safely.

Status pre‑Phase 0: **PASS (planned)** — implementation plan includes required artifacts and tests.

Status post‑Phase 1 (design artifacts generated): **PASS** — `research.md`, `data-model.md`,
`contracts/`, and `quickstart.md` exist and align with the constitution gates above.

## Project Structure

### Documentation (this feature)

```text
specs/001-promotions-discounts/
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
# Web application
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

**Structure Decision**: Use a `backend/` + `frontend/` split to keep pricing rules authoritative on the
backend while still supporting responsive, testable UI feedback on the frontend.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
