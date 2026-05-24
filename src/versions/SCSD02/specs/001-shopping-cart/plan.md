# Implementation Plan: Shopping Cart System

**Branch**: `001-shopping-cart` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-shopping-cart/spec.md`

## Summary

Implement shopping cart behavior for updating item quantities, merging duplicate SKU
additions, saving items for later, enforcing stock limits, and calculating exact cart
totals. The solution will expose cart operations through Express routes, persist active
and saved cart items in PostgreSQL, and update the React cart interface through a
dedicated cart service boundary.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS for backend and frontend

**Primary Dependencies**: Express 4.x, React ^18.3.1, PostgreSQL client or query
builder, Zod-style request validation, decimal-safe money helper

**Storage**: PostgreSQL 16-compatible schema with carts, cart_items, and product_stock
references

**Testing**: Vitest for unit tests, Supertest for Express integration and contract
checks, React Testing Library for cart interactions, PostgreSQL-backed database tests,
and Playwright smoke coverage for the primary cart flow when an app shell exists

**Target Platform**: Web application with browser frontend and HTTP backend service

**Project Type**: Web application with `backend/` and `frontend/` workspaces

**Performance Goals**: Cart mutations return updated state within 300 ms p95 at the
service boundary; user-visible cart totals update within 1 second; stock validation
queries use indexed lookups; any operation lasting over 500 ms shows visible feedback

**Constraints**: One active cart row per SKU per cart; saved items are excluded from
checkout totals; currency totals must be exact to two decimal places; over-stock
changes must preserve previous cart state

**Scale/Scope**: Single-cart shopping workflow covering quantity updates, duplicate
item merges, save-for-later, active totals, saved item display, stock rejection, and
decimal currency calculations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: PASS. Backend responsibilities are separated into Express routes,
  request validation, cart service logic, PostgreSQL repository functions, and shared
  cart contract types. Frontend responsibilities are separated into cart service calls,
  cart page state, row components, total display, and saved-items display.
- **Testing Standards**: PASS. The plan includes unit tests for cart math and merge
  rules, integration tests for Express cart operations, contract tests for request and
  response shapes, database tests for uniqueness/status behavior, and React interaction
  tests for cart states.
- **User Experience Consistency**: PASS. The design covers quantity controls, duplicate
  merge feedback, stock rejection, empty states, loading states, saved-items display,
  keyboard access, screen-reader labels, and responsive cart rows.
- **Performance Requirements**: PASS. The plan defines service p95, user-visible update,
  query, and loading-feedback budgets.
- **Stack And Data Integrity**: PASS. The plan confirms Node.js + Express backend,
  React ^18.3.1 frontend, PostgreSQL persistence, input validation, migration-backed
  schema changes, one-active-row data integrity, and rollback guidance.

## Project Structure

### Documentation (this feature)

```text
specs/001-shopping-cart/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cart-api.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   └── cart.routes.ts
│   ├── middleware/
│   │   └── validateRequest.ts
│   ├── models/
│   │   └── cart.types.ts
│   ├── repositories/
│   │   └── cart.repository.ts
│   └── services/
│       ├── cart.service.ts
│       └── money.service.ts
├── migrations/
│   └── 001_create_cart_tables.sql
└── tests/
    ├── contract/
    ├── database/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── components/
│   │   └── cart/
│   ├── pages/
│   │   └── CartPage.tsx
│   └── services/
│       └── cartService.ts
└── tests/
    └── cart/
```

**Structure Decision**: Use the web application layout required by the constitution:
Express backend in `backend/`, React ^18.3.1 frontend in `frontend/`, and PostgreSQL
migrations under `backend/migrations/`.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

## Phase 0: Research

Research decisions are captured in [research.md](./research.md). All technical context
unknowns are resolved.

## Phase 1: Design And Contracts

Design artifacts:

- [data-model.md](./data-model.md)
- [contracts/cart-api.openapi.yaml](./contracts/cart-api.openapi.yaml)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Code Quality**: PASS. Artifacts preserve route/service/repository/UI boundaries and
  define exact contract payloads.
- **Testing Standards**: PASS. Quickstart and contracts define unit, integration,
  contract, database, frontend interaction, and smoke validation paths.
- **User Experience Consistency**: PASS. Data and API responses support active cart,
  saved items, validation errors, loading feedback, and exact totals.
- **Performance Requirements**: PASS. Design uses indexed cart/SKU access, exact minor
  unit totals, bounded cart responses, and explicit interaction budgets.
- **Stack And Data Integrity**: PASS. Data model defines PostgreSQL constraints,
  transactional stock validation, one-active-row invariant, and rollback guidance.
