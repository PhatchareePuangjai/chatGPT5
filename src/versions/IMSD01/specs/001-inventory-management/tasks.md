# Tasks: Inventory Management — Stock Mutation & Alerts

**Input**: Design documents from `specs/001-inventory-management/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Included. The plan requires backend TDD and concurrency coverage for stock mutations.  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the backend, frontend, and local container workflow required by all stories.

- [ ] T001 Configure backend dependencies, pytest, and lint settings in `backend/pyproject.toml`
- [ ] T002 [P] Configure frontend React/Vite dependencies in `frontend/package.json`, `frontend/tsconfig.json`, and `frontend/vite.config.ts`
- [ ] T003 [P] Define the Docker local stack in `infrastructure/docker-compose.yml`, `infrastructure/docker/backend.Dockerfile`, and `infrastructure/docker/frontend.Dockerfile`
- [ ] T004 [P] Implement environment and logging configuration in `backend/src/config/settings.py` and `backend/src/config/logging.py`
- [ ] T005 [P] Configure database bootstrap and seed data in `backend/src/db/session.py`, `backend/src/db/base.py`, and `infrastructure/docker/init.sql`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared API, persistence, and test infrastructure that blocks all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Implement FastAPI app wiring and shared router registration in `backend/src/api/app.py` and `backend/src/api/router.py`
- [ ] T007 [P] Create the uniform response envelope and API error mapping in `backend/src/api/schemas/response.py` and `backend/src/api/errors.py`
- [ ] T008 [P] Create shared SQLAlchemy models for `Product` and `InventoryLog` in `backend/src/models/product.py` and `backend/src/models/inventory_log.py`
- [ ] T009 [P] Create shared SQLAlchemy models for `Order` and `Alert` in `backend/src/models/order.py` and `backend/src/models/alert.py`
- [ ] T010 Wire model exports and metadata registration in `backend/src/models/__init__.py` and `backend/src/db/base.py`
- [ ] T011 [P] Define shared inventory request/response schemas in `backend/src/api/schemas/inventory.py`
- [ ] T012 [P] Configure migrations and backend test fixtures in `backend/migrations/env.py` and `backend/tests/conftest.py`

**Checkpoint**: Foundation ready. User story work can begin in priority order.

---

## Phase 3: User Story 1 - Stock Deduction on Purchase (Priority: P1) 🎯 MVP

**Goal**: Deduct stock atomically after a successful purchase, record the stock mutation, and reject overselling.

**Independent Test**: Submit a purchase for 2 units against a product with 10 units in stock; verify the response returns success, the product stock becomes 8, and a `SALE` log with `-2` is stored.

### Tests for User Story 1 (TDD) ⚠️

> **NOTE**: Write these tests first and confirm they fail before implementation.

- [ ] T013 [P] [US1] Add contract coverage for `POST /inventory/purchase` in `backend/tests/contract/test_inventory_purchase.py`
- [ ] T014 [P] [US1] Add unit coverage for purchase validation and sale log creation in `backend/tests/unit/test_inventory_service_purchase.py`
- [ ] T015 [P] [US1] Add rollback coverage for partial failure handling in `backend/tests/integration/test_purchase_atomicity.py`
- [ ] T016 [P] [US1] Add concurrency coverage for oversell prevention in `backend/tests/integration/test_purchase_concurrency.py`
- [ ] T017 [P] [US1] Add insufficient-stock boundary coverage in `backend/tests/unit/test_purchase_boundary.py`

### Implementation for User Story 1

- [ ] T018 [US1] Implement the purchase stock mutation workflow with row locking in `backend/src/services/inventory_service.py`
- [ ] T019 [US1] Expose `POST /inventory/purchase` in `backend/src/api/routes/inventory.py`
- [ ] T020 [US1] Add purchase API client methods in `frontend/src/services/api.ts`
- [ ] T021 [US1] Build the purchase flow page and feedback states in `frontend/src/pages/Purchase.tsx`

**Checkpoint**: User Story 1 is independently functional as the MVP.

---

## Phase 4: User Story 2 - Low Stock Alert on Threshold Breach (Priority: P2)

**Goal**: Generate a low-stock alert whenever purchase completion leaves stock at or below the configured threshold.

**Independent Test**: Purchase from a product so the remaining quantity moves from above threshold to at-threshold or below-threshold; verify the purchase succeeds and an alert record is created only for the threshold-triggering cases.

### Tests for User Story 2 (TDD) ⚠️

- [ ] T022 [P] [US2] Add unit coverage for threshold comparison rules in `backend/tests/unit/test_low_stock_threshold.py`
- [ ] T023 [P] [US2] Add integration coverage for alert creation during purchase in `backend/tests/integration/test_low_stock_alert.py`

### Implementation for User Story 2

- [ ] T024 [US2] Implement low-stock alert creation logic in `backend/src/services/alert_service.py`
- [ ] T025 [US2] Integrate threshold evaluation and `alert_id` response handling into `backend/src/services/inventory_service.py` and `backend/src/api/schemas/inventory.py`
- [ ] T026 [US2] Surface low-stock alert results in the purchase UI in `frontend/src/pages/Purchase.tsx`

**Checkpoint**: User Story 2 is independently testable on top of the purchase flow.

---

## Phase 5: User Story 3 - Stock Restoration on Order Cancellation (Priority: P3)

**Goal**: Restore stock for cancelled or expired orders and persist the compensating inventory log entry atomically.

**Independent Test**: Cancel or expire an order that reserved 1 unit; verify the API returns success, stock increases by 1, and a positive `RESTOCK` or `RETURN` inventory log is recorded.

### Tests for User Story 3 (TDD) ⚠️

- [ ] T027 [P] [US3] Add contract coverage for `POST /inventory/cancel` in `backend/tests/contract/test_inventory_cancel.py`
- [ ] T028 [P] [US3] Add unit coverage for stock restoration and positive log creation in `backend/tests/unit/test_inventory_service_restore.py`
- [ ] T029 [P] [US3] Add integration coverage for cancellation and expiry restore flows in `backend/tests/integration/test_restore_stock.py`

### Implementation for User Story 3

- [ ] T030 [US3] Implement the cancellation and expiry restoration workflow in `backend/src/services/inventory_service.py`
- [ ] T031 [US3] Expose `POST /inventory/cancel` in `backend/src/api/routes/inventory.py`
- [ ] T032 [US3] Add cancel API client methods in `frontend/src/services/api.ts`
- [ ] T033 [US3] Build the cancellation and expiry flow page in `frontend/src/pages/Cancel.tsx`

**Checkpoint**: User Story 3 is independently functional without breaking the purchase flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish shared UX, validation, and operational checks across all stories.

- [ ] T034 [P] Add shared navigation and route shell in `frontend/src/App.tsx` and `frontend/src/main.tsx`
- [ ] T035 [P] Add end-to-end scenario regression coverage in `backend/tests/test_inventory_scenarios.py`
- [ ] T036 [P] Align local verification steps with the implemented stack in `specs/001-inventory-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user story work.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and reuses the purchase flow from US1.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and reuses shared inventory models and service infrastructure.
- **Polish (Phase 6)**: Depends on completion of all targeted user stories.

### User Story Dependencies

- **US1**: No dependency on other user stories once Foundational is complete.
- **US2**: Depends on US1 because alerts are generated from the purchase workflow.
- **US3**: Independent from US2 and can begin after Foundational, though it shares the same inventory service module as US1.

### Within Each User Story

- Tests must be written and failing before implementation begins.
- Backend service logic must be implemented before route wiring is finalized.
- API integration should exist before frontend pages are completed.
- Each story should be validated independently before moving on.

### Parallel Opportunities

- `T002`-`T005` can run in parallel during Setup.
- `T007`-`T012` can run in parallel during Foundational work where files do not overlap.
- All test tasks within a single story marked `[P]` can run in parallel.
- Frontend API wiring and page construction can run in parallel once backend contracts are stable for that story.

---

## Parallel Example: User Story 1

```bash
# Run the User Story 1 test tasks in parallel:
Task: "Add contract coverage for POST /inventory/purchase in backend/tests/contract/test_inventory_purchase.py"
Task: "Add unit coverage for purchase validation and sale log creation in backend/tests/unit/test_inventory_service_purchase.py"
Task: "Add rollback coverage for partial failure handling in backend/tests/integration/test_purchase_atomicity.py"
Task: "Add concurrency coverage for oversell prevention in backend/tests/integration/test_purchase_concurrency.py"
Task: "Add insufficient-stock boundary coverage in backend/tests/unit/test_purchase_boundary.py"
```

## Parallel Example: User Story 2

```bash
# Run the User Story 2 test tasks in parallel:
Task: "Add unit coverage for threshold comparison rules in backend/tests/unit/test_low_stock_threshold.py"
Task: "Add integration coverage for alert creation during purchase in backend/tests/integration/test_low_stock_alert.py"
```

## Parallel Example: User Story 3

```bash
# Run the User Story 3 test tasks in parallel:
Task: "Add contract coverage for POST /inventory/cancel in backend/tests/contract/test_inventory_cancel.py"
Task: "Add unit coverage for stock restoration and positive log creation in backend/tests/unit/test_inventory_service_restore.py"
Task: "Add integration coverage for cancellation and expiry restore flows in backend/tests/integration/test_restore_stock.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate the purchase flow independently before expanding scope.

### Incremental Delivery

1. Finish Setup and Foundational work to establish the base platform.
2. Deliver US1 as the first usable inventory mutation slice.
3. Layer US2 onto the purchase flow and validate threshold alerts.
4. Deliver US3 as the restoration flow for cancelled or expired orders.
5. Finish with Polish tasks and quickstart verification.

### Parallel Team Strategy

1. One engineer completes the shared platform work in Phases 1 and 2.
2. After Foundation is stable:
   - Engineer A implements US1 backend and route work.
   - Engineer B prepares frontend purchase flow and alert UI against stable contracts.
   - Engineer C implements US3 once shared inventory service patterns are established.

---

## Notes

- All tasks use the required checklist format: checkbox, task ID, optional `[P]`, required story label for story phases, and explicit file paths.
- Total tasks: 36
- Task counts by story: US1 = 9, US2 = 5, US3 = 7
- Suggested MVP scope: Phase 1, Phase 2, and Phase 3 (User Story 1) only
