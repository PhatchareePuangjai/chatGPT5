# Tasks: Inventory Management — Stock Mutation & Alerts

**Input**: Design documents from `specs/001-inventory-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included (TDD required by constitution and spec testing section).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend and frontend directories per plan in `backend/` and `frontend/`
- [X] T002 Move backend code into `backend/` (src, tests, pyproject.toml, migrations, alembic.ini)
- [X] T003 [P] Add minimal Vite React app scaffold in `frontend/`
- [X] T004 [P] Add Docker Compose file in `infrastructure/docker-compose.yml`
- [X] T005 [P] Add Dockerfiles in `infrastructure/docker/backend.Dockerfile` and `infrastructure/docker/frontend.Dockerfile`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T006 Update backend imports/paths after move in `backend/src/`
- [X] T007 Configure backend database URL for Docker in `backend/src/config/settings.py`
- [X] T008 [P] Add frontend API client helper in `frontend/src/services/api.ts`
- [X] T009 [P] Add backend CORS setup in `backend/src/api/app.py`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Stock Deduction on Purchase (Priority: P1) 🎯 MVP

**Goal**: Deduct stock on successful purchase, log the mutation, and prevent overselling.

**Independent Test**: Purchase 2 units from SKU-001 with stock 10; verify stock 8, SALE log -2, and success response.

### Tests for User Story 1 (TDD) ⚠️

- [X] T010 [P] [US1] Contract test for `POST /inventory/purchase` in `backend/tests/contract/test_inventory_purchase.py`
- [X] T011 [P] [US1] Unit test for purchase validation and log creation in `backend/tests/unit/test_inventory_service_purchase.py`
- [X] T012 [P] [US1] Integration test for transaction atomicity (log failure rollback) in `backend/tests/integration/test_purchase_atomicity.py`
- [X] T013 [P] [US1] Concurrency test for oversell prevention in `backend/tests/integration/test_purchase_concurrency.py`
- [X] T014 [P] [US1] Boundary test for insufficient stock rejection in `backend/tests/unit/test_purchase_boundary.py`

### Implementation for User Story 1

- [X] T015 [P] [US1] Ensure purchase schemas in `backend/src/api/schemas/inventory.py`
- [X] T016 [US1] Implement purchase service in `backend/src/services/inventory_service.py`
- [X] T017 [US1] Implement `POST /inventory/purchase` in `backend/src/api/routes/inventory.py`

### UI for User Story 1

- [X] T018 [P] [US1] Build purchase form UI in `frontend/src/pages/Purchase.tsx`
- [X] T019 [US1] Wire purchase form to API in `frontend/src/services/api.ts`

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Low Stock Alert on Threshold Breach (Priority: P2)

**Goal**: Generate a low-stock alert when stock falls at or below threshold after purchase.

**Independent Test**: Purchase to reach threshold (or below) and verify alert record creation.

### Tests for User Story 2 (TDD) ⚠️

- [X] T020 [P] [US2] Unit test for threshold boundary behavior in `backend/tests/unit/test_low_stock_threshold.py`
- [X] T021 [P] [US2] Integration test for alert creation on purchase in `backend/tests/integration/test_low_stock_alert.py`

### Implementation for User Story 2

- [X] T022 [P] [US2] Alert model in `backend/src/models/alert.py`
- [X] T023 [US2] Alert service in `backend/src/services/alert_service.py`
- [X] T024 [US2] Integrate alert check into purchase flow in `backend/src/services/inventory_service.py`
- [X] T025 [US2] Update purchase response schema to include `alert_id` in `backend/src/api/schemas/inventory.py`

### UI for User Story 2

- [X] T026 [US2] Show low-stock alert info in UI in `frontend/src/pages/Purchase.tsx`

**Checkpoint**: User Story 2 independently testable (alerts on threshold breach)

---

## Phase 5: User Story 3 - Stock Restoration on Order Cancellation (Priority: P3)

**Goal**: Restore stock and create RESTOCK/RETURN log when orders are cancelled or expired.

**Independent Test**: Cancel order for 1 unit and verify stock increases by 1 with RESTOCK/RETURN log.

### Tests for User Story 3 (TDD) ⚠️

- [X] T027 [P] [US3] Contract test for `POST /inventory/cancel` in `backend/tests/contract/test_inventory_cancel.py`
- [X] T028 [P] [US3] Unit test for restoration and log creation in `backend/tests/unit/test_inventory_service_restore.py`
- [X] T029 [P] [US3] Integration test for restore workflow in `backend/tests/integration/test_restore_stock.py`

### Implementation for User Story 3

- [X] T030 [P] [US3] Cancel schemas in `backend/src/api/schemas/inventory.py`
- [X] T031 [US3] Restore service in `backend/src/services/inventory_service.py`
- [X] T032 [US3] Implement `POST /inventory/cancel` in `backend/src/api/routes/inventory.py`

### UI for User Story 3

- [X] T033 [P] [US3] Build cancel form UI in `frontend/src/pages/Cancel.tsx`
- [X] T034 [US3] Wire cancel form to API in `frontend/src/services/api.ts`

**Checkpoint**: User Story 3 independently testable (restores stock with log)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T035 [P] Add shared layout and navigation in `frontend/src/App.tsx`
- [X] T036 [P] Update Docker Compose healthchecks in `infrastructure/docker-compose.yml`
- [X] T037 Update documentation in `specs/001-inventory-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) and integrates with US1 purchase flow
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel
- Tests within each story marked [P] can run in parallel
- UI tasks within each story marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (backend + UI)
4. STOP and validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
