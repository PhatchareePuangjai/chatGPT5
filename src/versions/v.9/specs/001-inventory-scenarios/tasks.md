---

description: "Task list for Inventory Stock Integrity"
---

# Tasks: Inventory Stock Integrity

**Input**: Design documents from `/specs/001-inventory-scenarios/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/  
**Tests**: Not requested in spec; no test tasks included per task rules.

**Stack (v.3 online-shop-inventory)**:

- Frontend: JavaScript, React `^18.3.1`, Vite `^5.4.8`
- Backend: Node.js (CommonJS), Express `^4.19.2`, pg `^8.12.0` (PostgreSQL)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Tests are omitted unless requested

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create base project structure in `backend/src/` and `frontend/src/`
- [x] T002 Initialize backend Node.js app with Express + pg in `backend/package.json`
- [x] T003 Initialize frontend Vite React app in `frontend/package.json`
- [x] T004 [P] Configure backend lint/format tooling in `backend/.eslintrc.cjs` and `backend/.prettierrc`
- [x] T005 [P] Configure frontend lint/format tooling in `frontend/.eslintrc.cjs` and `frontend/.prettierrc`
- [x] T006 [P] Add environment templates in `backend/.env.example` and `frontend/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create PostgreSQL connection module in `backend/src/db/index.js`
- [x] T008 Define initial schema SQL in `backend/sql/001_inventory_tables.sql`
- [x] T009 Build migration runner in `backend/scripts/run-migrations.js`
- [x] T010 Implement shared error handler middleware in `backend/src/middleware/errorHandler.js`
- [x] T011 Implement request validation helpers in `backend/src/validators/inventoryValidators.js`
- [x] T012 Wire Express app and routes in `backend/src/app.js` and `backend/src/routes/index.js`
- [x] T013 Add shared API response helpers in `backend/src/utils/apiResponse.js`
- [x] T014 Create frontend API client in `frontend/src/services/apiClient.js`
- [x] T015 Add shared frontend models in `frontend/src/models/inventory.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Deduct Stock on Purchase (Priority: P1) 🎯 MVP

**Goal**: Deduct stock on successful purchase and record an inventory log.

**Independent Test**: Submit a deduct request for a known SKU and confirm stock
is reduced and the response returns success.

### Implementation for User Story 1

- [x] T016 [P] [US1] Implement inventory repository in `backend/src/repositories/inventoryRepository.js`
- [x] T017 [P] [US1] Implement inventory log repository in `backend/src/repositories/inventoryLogRepository.js`
- [x] T018 [US1] Implement stock deduction service with transaction handling in `backend/src/services/stockService.js`
- [x] T019 [US1] Implement deduct controller in `backend/src/controllers/inventoryController.js`
- [x] T020 [US1] Add POST `/inventory/:sku/deduct` route in `backend/src/routes/inventoryRoutes.js`
- [x] T021 [P] [US1] Add deduct API method in `frontend/src/services/inventoryService.js`
- [x] T022 [P] [US1] Build deduct form component in `frontend/src/components/DeductStockForm.jsx`
- [x] T023 [US1] Build inventory page for deduction in `frontend/src/pages/InventoryPage.jsx`
- [x] T024 [US1] Wire inventory page route in `frontend/src/App.jsx`

**Checkpoint**: User Story 1 is functional and testable independently

---

## Phase 4: User Story 2 - Low Stock Alerts (Priority: P2)

**Goal**: Trigger and surface low-stock alerts when thresholds are reached.

**Independent Test**: Deduct stock to cross the threshold and verify an alert is created and listed.

### Implementation for User Story 2

- [x] T025 [P] [US2] Implement stock alert repository in `backend/src/repositories/stockAlertRepository.js`
- [x] T026 [US2] Add alert creation logic to stock service in `backend/src/services/stockService.js`
- [x] T027 [US2] Implement GET `/inventory/:sku/alerts` handler in `backend/src/controllers/inventoryController.js`
- [x] T028 [US2] Add alerts route in `backend/src/routes/inventoryRoutes.js`
- [x] T029 [P] [US2] Add alerts API method in `frontend/src/services/inventoryService.js`
- [x] T030 [P] [US2] Build alerts list component in `frontend/src/components/StockAlertsList.jsx`
- [x] T031 [US2] Render alerts section in `frontend/src/pages/InventoryPage.jsx`

**Checkpoint**: User Stories 1 and 2 are independently functional

---

## Phase 5: User Story 3 - Restore Stock on Cancellation (Priority: P3)

**Goal**: Restore stock when orders are canceled or expire and log the change.

**Independent Test**: Submit a restore request for a reserved order and verify stock and logs update.

### Implementation for User Story 3

- [x] T032 [P] [US3] Implement order reservation repository in `backend/src/repositories/orderReservationRepository.js`
- [x] T033 [US3] Add restore logic to stock service in `backend/src/services/stockService.js`
- [x] T034 [US3] Implement POST `/inventory/:sku/restore` handler in `backend/src/controllers/inventoryController.js`
- [x] T035 [US3] Add restore route in `backend/src/routes/inventoryRoutes.js`
- [x] T036 [P] [US3] Add restore API method in `frontend/src/services/inventoryService.js`
- [x] T037 [P] [US3] Build restore form component in `frontend/src/components/RestoreStockForm.jsx`
- [x] T038 [US3] Render restore form in `frontend/src/pages/InventoryPage.jsx`

**Checkpoint**: All user stories are independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T039 [P] Add structured logging utilities in `backend/src/utils/logger.js`
- [x] T040 Update stock service logging in `backend/src/services/stockService.js`
- [x] T041 Add README usage notes for inventory API in `README.md`
- [x] T042 Create performance validation script in `backend/scripts/benchmark-stock.js`
- [x] T043 Run quickstart validation and update `specs/001-inventory-scenarios/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2); depends on stock service updates from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2); depends on stock service updates from US1

### Within Each User Story

- Repositories before services
- Services before controllers/routes
- Backend endpoints before frontend integration

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel
- Frontend tasks within a story can run in parallel once backend endpoints are defined
- Different user stories can be worked on in parallel after the foundation

---

## Parallel Example: User Story 1

```bash
# Launch repository work in parallel:
Task: "Implement inventory repository in backend/src/repositories/inventoryRepository.js"
Task: "Implement inventory log repository in backend/src/repositories/inventoryLogRepository.js"

# Frontend tasks can run in parallel after API method is defined:
Task: "Build deduct form component in frontend/src/components/DeductStockForm.jsx"
Task: "Build inventory page for deduction in frontend/src/pages/InventoryPage.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify stock deduction independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Validate independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Validate independently → Deploy/Demo
4. Add User Story 3 → Validate independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
