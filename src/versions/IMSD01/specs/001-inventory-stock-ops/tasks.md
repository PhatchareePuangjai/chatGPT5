---
description: "Tasks for Inventory Stock Operations"
---

# Tasks: Inventory Stock Operations

**Input**: Design documents from `specs/001-inventory-stock-ops/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by default per `.specify/memory/constitution.md`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Every task includes concrete file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish backend + frontend skeleton with consistent tooling

- [X] T001 Create web-app folder structure per plan.md (`backend/`, `frontend/`) with placeholder `README.md` files
- [X] T002 Initialize backend Node/TypeScript project in `backend/` (`backend/package.json`, `backend/tsconfig.json`)
- [X] T003 Initialize frontend React/TypeScript project in `frontend/` (`frontend/package.json`, `frontend/tsconfig.json`)
- [X] T004 [P] Add repo-wide formatting/linting configs (`.editorconfig`, `.prettierrc`, `.prettierignore`)
- [X] T005 [P] Add backend lint/test config (`backend/.eslintrc.*`, `backend/vitest.config.ts`) and scripts in `backend/package.json`
- [X] T006 [P] Add frontend lint/test config (`frontend/.eslintrc.*`, `frontend/vitest.config.ts`) and scripts in `frontend/package.json`
- [X] T007 Add basic CI-friendly test scripts (`backend/package.json` + `frontend/package.json`: `lint`, `test`, `test:ci`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before any user story can ship

- [X] T008 Setup backend environment config loader (`backend/src/config/env.ts`) and `.env.example`
- [X] T009 Setup PostgreSQL connection pool and query helpers (`backend/src/db/pool.ts`, `backend/src/db/query.ts`)
- [X] T010 Setup migrations framework and baseline migration runner (`backend/migrations/`, `backend/src/db/migrate.ts`)
- [X] T011 Create database schema migrations for core entities (`backend/migrations/*_create_products.sql`, `*_create_inventory_logs.sql`, `*_create_stock_alerts.sql`)
- [X] T012 Setup Express server skeleton (`backend/src/server.ts`, `backend/src/app.ts`)
- [X] T013 Implement request id middleware (read/echo `X-Request-Id` or generate) (`backend/src/api/middleware/requestId.ts`)
- [X] T014 Implement structured logging and error handling middleware (`backend/src/api/middleware/logger.ts`, `backend/src/api/middleware/errorHandler.ts`)
- [X] T015 Implement request validation utilities (`backend/src/api/validation/validators.ts`)
- [X] T016 Implement shared response helpers to enforce error shape from contracts (`backend/src/api/http/respond.ts`)
- [X] T017 Add backend integration test harness (test DB config + app bootstrap) (`backend/tests/helpers/testApp.ts`, `backend/tests/helpers/testDb.ts`)
- [X] T018 Add frontend API client wrapper with consistent error handling (`frontend/src/services/apiClient.ts`)
- [X] T019 Add minimal admin navigation shell (pages + routing) (`frontend/src/pages/App.tsx`, `frontend/src/pages/routes.tsx`)

**Checkpoint**: Foundation ready (migrations runnable; API + test harness exist; frontend can call API)

---

## Phase 3: User Story 1 - Purchase Deducts Stock (Priority: P1) MVP

**Goal**: Deduct stock after successful purchase; log the mutation; prevent oversell under concurrency

**Independent Test**: Start with SKU-001 on-hand=10 and threshold=5; call deduct endpoint and verify on-hand=8 and log entry type SALE delta=-2; run race test and verify exactly one success.

### Tests for User Story 1

> Tests should be written first and observed failing before implementation is completed.

- [X] T020 [P] [US1] Add API contract test for `POST /api/inventory/deduct` success response shape (`backend/tests/contract/inventory.deduct.contract.test.ts`)
- [X] T021 [P] [US1] Add API integration test: successful deduction updates stock + inserts log (`backend/tests/integration/inventory.deduct.success.test.ts`)
- [X] T022 [P] [US1] Add API integration test: overselling attempt rejected and no mutation occurs (`backend/tests/integration/inventory.deduct.insufficient.test.ts`)
- [X] T023 [US1] Add API integration test: transaction atomicity rollback when log insert fails (`backend/tests/integration/inventory.atomicity.rollback.test.ts`)
- [X] T024 [US1] Add API integration test: race condition (5 concurrent deducts for last unit) (`backend/tests/integration/inventory.deduct.race.test.ts`)
- [X] T025 [P] [US1] Add backend unit tests for deduction business rules (`backend/tests/unit/inventoryService.deduct.test.ts`)

### Implementation for User Story 1

- [X] T026 [P] [US1] Implement Product data access helpers (`backend/src/models/productRepo.ts`)
- [X] T027 [P] [US1] Implement InventoryLog data access helpers (`backend/src/models/inventoryLogRepo.ts`)
- [X] T028 [US1] Implement inventory deduction service with row lock + atomic transaction (`backend/src/services/inventoryService.ts`)
- [X] T029 [US1] Implement `POST /api/inventory/deduct` route (validation + service call + error mapping) (`backend/src/api/routes/inventory.ts`)
- [X] T030 [US1] Wire inventory routes into app (`backend/src/api/routes/index.ts`, `backend/src/app.ts`)
- [X] T031 [P] [US1] Add frontend admin screen for deducting stock (form + validation) (`frontend/src/pages/InventoryDeductPage.tsx`, `frontend/src/components/forms/InventoryDeductForm.tsx`)
- [X] T032 [P] [US1] Add frontend tests for deduct flow and error UX (`frontend/tests/inventoryDeduct.flow.test.tsx`)

**Checkpoint**: US1 is independently functional and testable (deduct endpoint + UI + tests)

---

## Phase 4: User Story 2 - Low Stock Alert (Priority: P2)

**Goal**: Create a low-stock alert record whenever a SKU quantity becomes <= threshold

**Independent Test**: Start with SKU-002 on-hand=6 threshold=5; deduct 2; verify on-hand=4 and alert record exists; verify boundary behavior at 6/5/4.

### Tests for User Story 2

- [X] T033 [P] [US2] Add integration test: alert created when quantity crosses to <= threshold (`backend/tests/integration/alerts.lowStock.created.test.ts`)
- [X] T034 [P] [US2] Add integration test: no alert when remaining quantity stays above threshold (`backend/tests/integration/alerts.lowStock.notCreatedAboveThreshold.test.ts`)
- [X] T035 [P] [US2] Add integration test: inclusive boundary (quantity==threshold triggers alert) (`backend/tests/integration/alerts.lowStock.boundaryInclusive.test.ts`)

### Implementation for User Story 2

- [X] T036 [P] [US2] Implement StockAlert data access helpers (`backend/src/models/stockAlertRepo.ts`)
- [X] T037 [US2] Extend `inventoryService` deduction flow to create alert record when `on_hand <= threshold` (`backend/src/services/inventoryService.ts`)
- [X] T038 [US2] Implement `GET /api/alerts/low-stock` route (`backend/src/api/routes/alerts.ts`)
- [X] T039 [P] [US2] Add frontend page to list low-stock alerts (`frontend/src/pages/LowStockAlertsPage.tsx`, `frontend/src/components/tables/AlertsTable.tsx`)
- [X] T040 [P] [US2] Add frontend behavior tests for alerts list (`frontend/tests/lowStockAlerts.list.test.tsx`)

**Checkpoint**: US2 is independently functional and testable (alerts generated + list endpoint + UI)

---

## Phase 5: User Story 3 - Cancellation Restores Stock (Priority: P3)

**Goal**: Restore stock when an order is canceled or expired; log the restoration

**Independent Test**: Start with SKU-003 on-hand=5; call restore for quantity=1; verify on-hand=6 and log entry exists with type RESTOCK/RETURN delta=+1.

### Tests for User Story 3

- [X] T041 [P] [US3] Add API contract test for `POST /api/inventory/restore` response shape (`backend/tests/contract/inventory.restore.contract.test.ts`)
- [X] T042 [P] [US3] Add API integration test: restore increments stock + inserts log (`backend/tests/integration/inventory.restore.success.test.ts`)
- [X] T043 [P] [US3] Add backend unit tests for restoration rules (`backend/tests/unit/inventoryService.restore.test.ts`)

### Implementation for User Story 3

- [X] T044 [US3] Implement inventory restoration service with atomic transaction (`backend/src/services/inventoryService.ts`)
- [X] T045 [US3] Implement `POST /api/inventory/restore` route (validation + service call + error mapping) (`backend/src/api/routes/inventory.ts`)
- [X] T046 [P] [US3] Add frontend admin screen for restoration flow (`frontend/src/pages/InventoryRestorePage.tsx`, `frontend/src/components/forms/InventoryRestoreForm.tsx`)
- [X] T047 [P] [US3] Add frontend tests for restore flow (`frontend/tests/inventoryRestore.flow.test.tsx`)

**Checkpoint**: US3 is independently functional and testable (restore endpoint + UI + tests)

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T048 Add API documentation pointer to contracts in backend README (`backend/README.md`)
- [X] T049 Ensure all API errors match contract shape and status codes (audit + test adjustments) (`backend/src/api/http/respond.ts`, `backend/src/api/middleware/errorHandler.ts`)
- [X] T050 Add basic performance guardrails (index review + query shape assertions in tests where practical) (`backend/migrations/*`, `backend/tests/integration/*`)
- [X] T051 Run quickstart smoke tests and document results (`specs/001-inventory-stock-ops/quickstart.md`)

---

## Dependencies & Execution Order

- Phase 1 -> Phase 2 -> US1 -> US2 -> US3 -> Polish
- US2 depends on US1 (alerts are triggered during deduction flow)
- US3 can be implemented after Phase 2 but is scheduled after US2 to follow spec priority

## Parallel Opportunities

- T004-T006 can run in parallel
- Within Phase 2, T008-T016 can be split across people as long as integration points are agreed
- Within each user story phase, contract/integration/unit tests marked [P] can be written in parallel

## MVP Scope

- MVP is US1 only: deduct stock + audit log + oversell prevention + concurrency test + minimal admin UI.
