---

description: "Tasks for inventory stock operations feature"
---

# Tasks: Inventory Stock Operations

**Input**: Design documents from `specs/001-scenarios-spec/`

**Prerequisites**: `specs/001-scenarios-spec/plan.md` (required), `specs/001-scenarios-spec/spec.md` (required), `specs/001-scenarios-spec/data-model.md`, `specs/001-scenarios-spec/contracts/api.md`, `specs/001-scenarios-spec/quickstart.md`

**Tests**: Per the constitution, tests are REQUIRED for meaningful behavior changes; omit only with explicit justification in `spec.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `backend/` + `frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repository scaffolding for backend/frontend and shared tooling

- [x] T001 Create web app directory structure per plan in `backend/` and `frontend/`
- [x] T002 Initialize backend Node.js project in `backend/package.json` (TypeScript + Express baseline)
- [x] T003 Initialize frontend React project in `frontend/package.json` (React 18 baseline)
- [x] T004 [P] Add root-level tooling docs in `README.md` (how to run backend/frontend locally)
- [x] T005 [P] Configure formatting and linting for backend in `backend/.eslintrc.*`, `backend/.prettierrc*`
- [x] T006 [P] Configure formatting and linting for frontend in `frontend/.eslintrc.*`, `frontend/.prettierrc*`
- [x] T007 [P] Add backend test runner config in `backend/vitest.config.*`
- [x] T008 [P] Add frontend test runner config in `frontend/vitest.config.*`
- [x] T009 [P] Add Playwright E2E setup in `frontend/playwright.config.*` and `frontend/tests/e2e/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DB schema/migrations, shared error/logging, API plumbing, and deterministic test infra

- [x] T010 Add local PostgreSQL dev stack in `docker-compose.yml` and environment example in `.env.example`
- [x] T011 Choose and initialize a migrations tool; create baseline migration runner in `backend/src/db/migrate.*`
- [x] T012 Create initial DB schema migration for entities in `backend/migrations/001_init.sql` (SKU, Order, OrderLine, InventoryLog, LowStockAlert)
- [x] T013 [P] Add backend DB connection module in `backend/src/db/pool.*`
- [x] T014 [P] Add backend transaction helper in `backend/src/db/tx.*` (single unit-of-work boundary)
- [x] T015 [P] Add consistent API error shape middleware in `backend/src/api/middleware/errorHandler.*`
- [x] T016 [P] Add request logging middleware in `backend/src/api/middleware/requestLogger.*` (no secrets)
- [x] T017 Add backend app entrypoint and routing skeleton in `backend/src/api/app.*` and `backend/src/api/routes/index.*`
- [x] T018 Add config loading and validation in `backend/src/config/index.*`
- [x] T019 [P] Add backend integration test DB harness in `backend/tests/helpers/dbTestHarness.*` (migrate + cleanup deterministically)
- [x] T020 [P] Add backend contract types (request/response) in `backend/src/api/contracts/inventory.*`

**Checkpoint**: Foundation ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - Complete Purchase Updates Inventory (Priority: P1) 🎯 MVP

**Goal**: Confirmed purchase deducts stock and records an audit log; cancel/expire restores stock and records an audit log; oversell attempts are rejected without changes.

**Independent Test**: Using the API, set a SKU on-hand value, confirm an order to deduct stock, verify SKU on-hand and InventoryLog; cancel/expire restores stock and logs; oversell rejects and does not change SKU/log.

### Tests for User Story 1 (REQUIRED for behavior changes) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US1] Add integration tests for confirm order endpoint in `backend/tests/integration/orders.confirm.test.*`
- [x] T022 [P] [US1] Add integration tests for cancel order endpoint in `backend/tests/integration/orders.cancel.test.*`
- [x] T023 [P] [US1] Add integration test for oversell rejection in `backend/tests/integration/orders.oversell.test.*`
- [x] T024 [P] [US1] Add unit tests for inventory service rules in `backend/tests/unit/inventoryService.test.*`

### Implementation for User Story 1

- [x] T025 [P] [US1] Implement SKU repository functions in `backend/src/models/skuRepo.*` (get/update with concurrency-safe primitives)
- [x] T026 [P] [US1] Implement InventoryLog repository in `backend/src/models/inventoryLogRepo.*`
- [x] T027 [P] [US1] Implement Order + OrderLine repositories in `backend/src/models/orderRepo.*` and `backend/src/models/orderLineRepo.*`
- [x] T028 [US1] Implement inventory deduction/restore service in `backend/src/services/inventoryService.*` (transaction + audit log)
- [x] T029 [US1] Implement confirm order handler + route in `backend/src/api/routes/orders.*` matching `specs/001-scenarios-spec/contracts/api.md`
- [x] T030 [US1] Implement cancel order handler + route in `backend/src/api/routes/orders.*` matching `specs/001-scenarios-spec/contracts/api.md`
- [x] T031 [US1] Ensure rejected oversell attempts do not write InventoryLog and do not change SKU (service-level guard in `backend/src/services/inventoryService.*`)
- [x] T032 [P] [US1] Add minimal admin SKU endpoints used for test setup in `backend/src/api/routes/skus.*` (PUT/GET)

**Checkpoint**: User Story 1 is independently functional and testable via API.

---

## Phase 4: User Story 2 - Low Stock Alert on Threshold (Priority: P2)

**Goal**: Create/emit an alert when SKU on-hand is less than or equal to its low-stock threshold, including correct boundary behavior.

**Independent Test**: Configure threshold for a SKU, perform a stock deduction to reach 6/5/4, and verify alerts trigger exactly at and below threshold.

### Tests for User Story 2 (REQUIRED for behavior changes) ⚠️

- [x] T033 [P] [US2] Add integration test for low-stock boundary behavior in `backend/tests/integration/alerts.threshold.test.*`
- [x] T034 [P] [US2] Add unit tests for alert idempotency rules in `backend/tests/unit/lowStockAlertService.test.*`

### Implementation for User Story 2

- [x] T035 [P] [US2] Implement LowStockAlert repository in `backend/src/models/lowStockAlertRepo.*`
- [x] T036 [US2] Implement low-stock alert service in `backend/src/services/lowStockAlertService.*` (<= threshold logic, idempotency)
- [x] T037 [US2] Integrate alert triggering into stock mutation flow in `backend/src/services/inventoryService.*`
- [x] T038 [P] [US2] Add alerts list endpoint in `backend/src/api/routes/alerts.*` (GET)

**Checkpoint**: Alerts are triggered and observable via API in a deterministic way.

---

## Phase 5: User Story 3 - Prevent Overselling Under Concurrency (Priority: P3)

**Goal**: Under high contention, only allowable purchases succeed; inventory never goes negative; atomicity guarantees still hold.

**Independent Test**: Seed on-hand=1 for a SKU; run 5 concurrent confirms; assert 1 success, 4 insufficient stock; final on-hand=0; logs match.

### Tests for User Story 3 (REQUIRED for behavior changes) ⚠️

- [x] T039 [P] [US3] Add concurrency integration test (5 concurrent confirms) in `backend/tests/integration/orders.concurrency.test.*`
- [x] T040 [P] [US3] Add atomicity failure simulation test (audit log failure causes rollback) in `backend/tests/integration/orders.atomicity.test.*`

### Implementation for User Story 3

- [x] T041 [US3] Implement concurrency-safe stock claim in `backend/src/models/skuRepo.*` (lock and update within a transaction)
- [x] T042 [US3] Ensure inventory service uses the concurrency-safe repo method in `backend/src/services/inventoryService.*`
- [x] T043 [US3] Add structured error mapping for insufficient stock in `backend/src/api/middleware/errorHandler.*` (409 `INSUFFICIENT_STOCK`)

**Checkpoint**: Concurrency and atomicity scenarios are enforced and verified by tests.

---

## Phase 6: Minimal UI (Support UX Consistency)

**Purpose**: Provide a small admin UI to exercise the scenarios in `specs/001-scenarios-spec/quickstart.md`

- [x] T044 [P] Create a reusable layout shell in `frontend/src/components/AppShell.*`
- [x] T045 [P] Create shared form components (inputs, validation messaging) in `frontend/src/components/forms/*`
- [x] T046 [P] Add API client wrapper in `frontend/src/services/apiClient.*` (consistent error handling)
- [x] T047 [P] Implement SKU page (view/update on-hand and threshold) in `frontend/src/pages/SkuPage.*`
- [x] T048 [P] Implement Alerts page (list active alerts) in `frontend/src/pages/AlertsPage.*`
- [x] T049 [P] Implement Order simulation page (confirm/cancel by order id) in `frontend/src/pages/OrderSimPage.*`
- [x] T050 [P] Add component tests for the three pages in `frontend/tests/components/pages.test.*`
- [x] T051 Add an E2E flow covering "update SKU -> confirm order -> see alert" in `frontend/tests/e2e/inventory-flow.spec.*`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and quality gates that affect multiple stories

- [x] T052 Add API response time and payload size notes to `specs/001-scenarios-spec/research.md` after baseline measurement
- [x] T053 Add structured logging event names for inventory mutations in `backend/src/services/inventoryService.*`
- [x] T054 Ensure migrations are runnable in CI-like mode; document commands in `specs/001-scenarios-spec/quickstart.md`
- [x] T055 Run through acceptance checks from `specs/001-scenarios-spec/quickstart.md` and record results in `specs/001-scenarios-spec/quickstart.md`

---

## Dependencies & Execution Order

- Phase 1 (Setup) -> Phase 2 (Foundational) blocks all user stories.
- US1 is the MVP and can ship independently after Foundational.
- US2 depends on US1 stock mutation flow being present.
- US3 depends on US1 logic and adds stronger concurrency/atomicity guarantees.
- Minimal UI can start after API endpoints exist (US1/US2), and E2E depends on UI + API.

---

## Parallel Example: User Story 1

```bash
Task: "Integration tests for confirm order endpoint in backend/tests/integration/orders.confirm.test.*"
Task: "Integration tests for cancel order endpoint in backend/tests/integration/orders.cancel.test.*"
Task: "SKU repository functions in backend/src/models/skuRepo.*"
Task: "InventoryLog repository in backend/src/models/inventoryLogRepo.*"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup + Foundational
2. Complete US1 tests and implementation
3. Validate US1 independently via API

### Incremental Delivery

1. Add US2 alerting and validate boundary behavior
2. Add US3 concurrency and atomicity tests and enforce locking/transactions
3. Add minimal UI and E2E coverage for critical flow
