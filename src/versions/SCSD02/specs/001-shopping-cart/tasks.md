# Tasks: Shopping Cart System

**Input**: Design documents from `specs/001-shopping-cart/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by the SCSD02 constitution and this feature plan. Write tests first
and confirm they fail before implementing each story.

**Organization**: Tasks are grouped by user story so each story can be implemented,
tested, and demonstrated independently after the foundational work is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency
  on an incomplete task.
- **[Story]**: User story label for story-phase tasks only.
- Every task includes an exact file path.

## Path Conventions

- Backend: `backend/src/`, `backend/migrations/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`
- Contracts and feature docs: `specs/001-shopping-cart/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Node.js, Express, React, PostgreSQL, and TypeScript workspace
foundation used by all stories.

- [ ] T001 Create root workspace manifest with backend/frontend scripts in `package.json`
- [ ] T002 Create backend TypeScript package manifest and dependencies in `backend/package.json`
- [ ] T003 Create frontend React ^18.3.1 package manifest and dependencies in `frontend/package.json`
- [ ] T004 [P] Configure shared TypeScript settings in `tsconfig.base.json`
- [ ] T005 [P] Configure backend TypeScript settings in `backend/tsconfig.json`
- [ ] T006 [P] Configure frontend TypeScript settings in `frontend/tsconfig.json`
- [ ] T007 [P] Configure linting and formatting rules in `eslint.config.js`
- [ ] T008 [P] Create backend environment example with DATABASE_URL in `backend/.env.example`
- [ ] T009 [P] Create frontend Vite app entry files in `frontend/src/main.tsx`
- [ ] T010 [P] Create frontend app shell route placeholder in `frontend/src/App.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared contracts, persistence, app bootstrap, validation, and test
harnesses required before any user story implementation.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T011 Create backend Express app bootstrap in `backend/src/app.ts`
- [ ] T012 Create backend server entrypoint in `backend/src/server.ts`
- [ ] T013 Create PostgreSQL connection module in `backend/src/db/pool.ts`
- [ ] T014 Create cart domain types matching the OpenAPI contract in `backend/src/models/cart.types.ts`
- [ ] T015 Create cart API request validation schemas in `backend/src/api/cart.schemas.ts`
- [ ] T016 Create request validation middleware in `backend/src/middleware/validateRequest.ts`
- [ ] T017 Create centralized error response middleware in `backend/src/middleware/errorHandler.ts`
- [ ] T018 Create decimal-safe money helper in `backend/src/services/money.service.ts`
- [ ] T019 Create initial cart schema migration in `backend/migrations/001_create_cart_tables.sql`
- [ ] T020 Create migration rollback for cart schema in `backend/migrations/001_create_cart_tables.down.sql`
- [ ] T021 Create cart repository skeleton with transaction helper in `backend/src/repositories/cart.repository.ts`
- [ ] T022 Create cart service skeleton with public method signatures in `backend/src/services/cart.service.ts`
- [ ] T023 Create cart route skeleton for OpenAPI operations in `backend/src/api/cart.routes.ts`
- [ ] T024 Wire cart routes and middleware into Express app in `backend/src/app.ts`
- [ ] T025 [P] Configure backend unit test setup in `backend/tests/setup/unit.setup.ts`
- [ ] T026 [P] Configure backend integration test setup with test database in `backend/tests/setup/integration.setup.ts`
- [ ] T027 [P] Configure frontend test setup in `frontend/tests/setup.ts`
- [ ] T028 [P] Add OpenAPI contract fixture in `backend/tests/contract/cart-api.openapi.yaml`
- [ ] T029 [P] Create frontend cart service skeleton in `frontend/src/services/cartService.ts`
- [ ] T030 [P] Create cart page placeholder in `frontend/src/pages/CartPage.tsx`

**Checkpoint**: Foundation ready. Story work can start in priority order or in parallel
where team capacity allows.

---

## Phase 3: User Story 1 - Update Item Quantity (Priority: P1) MVP

**Goal**: A shopper updates an active cart item quantity and immediately sees quantity,
line total, and grand total update.

**Independent Test**: Start with product A at 100 baht and quantity 1, change quantity
to 3, and verify quantity 3, line total 300 baht, and updated grand total.

### Tests for User Story 1 (REQUIRED)

- [ ] T031 [P] [US1] Add money precision unit tests for 100x3 and 19.99x3 in `backend/tests/unit/money.service.test.ts`
- [ ] T032 [P] [US1] Add cart quantity service unit tests in `backend/tests/unit/cart.service.quantity.test.ts`
- [ ] T033 [P] [US1] Add PATCH quantity contract tests in `backend/tests/contract/cart.quantity.contract.test.ts`
- [ ] T034 [P] [US1] Add quantity update integration tests in `backend/tests/integration/cart.quantity.test.ts`
- [ ] T035 [P] [US1] Add cart item database tests for positive quantity and total fields in `backend/tests/database/cart_items.test.ts`
- [ ] T036 [P] [US1] Add React quantity interaction tests in `frontend/tests/cart/CartPage.quantity.test.tsx`

### Implementation for User Story 1

- [ ] T037 [US1] Implement money formatting and minor-unit arithmetic in `backend/src/services/money.service.ts`
- [ ] T038 [US1] Implement repository methods to read cart and update active item quantity in `backend/src/repositories/cart.repository.ts`
- [ ] T039 [US1] Implement quantity update business logic and total recalculation in `backend/src/services/cart.service.ts`
- [ ] T040 [US1] Implement PATCH `/cart/items/{itemId}/quantity` route in `backend/src/api/cart.routes.ts`
- [ ] T041 [US1] Implement frontend cart service quantity call in `frontend/src/services/cartService.ts`
- [ ] T042 [US1] Implement cart row quantity controls in `frontend/src/components/cart/CartItemRow.tsx`
- [ ] T043 [US1] Implement cart totals display in `frontend/src/components/cart/CartTotals.tsx`
- [ ] T044 [US1] Render active cart rows and totals on the cart page in `frontend/src/pages/CartPage.tsx`
- [ ] T045 [US1] Add loading feedback for quantity updates in `frontend/src/components/cart/CartItemRow.tsx`
- [ ] T046 [US1] Document quantity update validation in `specs/001-shopping-cart/quickstart.md`

**Checkpoint**: User Story 1 is complete when quantity updates and exact totals pass all
US1 tests and can be demonstrated independently.

---

## Phase 4: User Story 2 - Merge Duplicate Cart Items (Priority: P2)

**Goal**: Adding a product already in the active cart merges quantities into one row
and rejects over-stock requests without changing the cart.

**Independent Test**: Start with SKU-001 quantity 1, add 2 more units, verify one row
with quantity 3; then attempt an over-stock addition and verify the error and unchanged
quantity.

### Tests for User Story 2 (REQUIRED)

- [ ] T047 [P] [US2] Add merge duplicate service unit tests in `backend/tests/unit/cart.service.merge.test.ts`
- [ ] T048 [P] [US2] Add insufficient stock service unit tests in `backend/tests/unit/cart.service.stock.test.ts`
- [ ] T049 [P] [US2] Add POST add item contract tests for merge and 409 responses in `backend/tests/contract/cart.add-item.contract.test.ts`
- [ ] T050 [P] [US2] Add add-to-cart merge integration tests in `backend/tests/integration/cart.add-item.test.ts`
- [ ] T051 [P] [US2] Add database uniqueness tests for one active row per SKU in `backend/tests/database/cart_active_sku_unique.test.ts`
- [ ] T052 [P] [US2] Add React stock rejection tests in `frontend/tests/cart/CartPage.stock.test.tsx`

### Implementation for User Story 2

- [ ] T053 [US2] Add active SKU uniqueness constraint to migration in `backend/migrations/001_create_cart_tables.sql`
- [ ] T054 [US2] Add rollback for active SKU uniqueness constraint in `backend/migrations/001_create_cart_tables.down.sql`
- [ ] T055 [US2] Implement repository methods to find active item by SKU and lock stock row in `backend/src/repositories/cart.repository.ts`
- [ ] T056 [US2] Implement duplicate merge and stock validation transaction in `backend/src/services/cart.service.ts`
- [ ] T057 [US2] Implement POST `/cart/items` add-or-merge route in `backend/src/api/cart.routes.ts`
- [ ] T058 [US2] Return `INSUFFICIENT_STOCK` with "สินค้าไม่เพียงพอ" in `backend/src/middleware/errorHandler.ts`
- [ ] T059 [US2] Implement frontend add-to-cart service call in `frontend/src/services/cartService.ts`
- [ ] T060 [US2] Add stock rejection message rendering in `frontend/src/components/cart/CartItemRow.tsx`
- [ ] T061 [US2] Preserve previous cart state after stock rejection in `frontend/src/pages/CartPage.tsx`
- [ ] T062 [US2] Add merge and stock rejection quickstart checks in `specs/001-shopping-cart/quickstart.md`

**Checkpoint**: User Story 2 is complete when duplicate adds merge correctly, over-stock
adds are rejected with unchanged state, and all US2 tests pass.

---

## Phase 5: User Story 3 - Save Item For Later (Priority: P3)

**Goal**: A shopper moves an active cart item to saved items, removing it from checkout
totals while preserving it in a separate saved list.

**Independent Test**: Start with SKU-005 active in the cart, select "Save for Later",
and verify it moves to saved items and is excluded from active totals.

### Tests for User Story 3 (REQUIRED)

- [ ] T063 [P] [US3] Add save-for-later service unit tests in `backend/tests/unit/cart.service.save-for-later.test.ts`
- [ ] T064 [P] [US3] Add save-for-later contract tests in `backend/tests/contract/cart.save-for-later.contract.test.ts`
- [ ] T065 [P] [US3] Add save-for-later integration tests in `backend/tests/integration/cart.save-for-later.test.ts`
- [ ] T066 [P] [US3] Add database status transition tests in `backend/tests/database/cart_item_status.test.ts`
- [ ] T067 [P] [US3] Add React save-for-later interaction tests in `frontend/tests/cart/CartPage.save-for-later.test.tsx`
- [ ] T068 [P] [US3] Add accessibility tests for quantity controls and save action in `frontend/tests/cart/CartPage.accessibility.test.tsx`

### Implementation for User Story 3

- [ ] T069 [US3] Implement repository method to update cart item status to saved in `backend/src/repositories/cart.repository.ts`
- [ ] T070 [US3] Implement save-for-later business logic and active total recalculation in `backend/src/services/cart.service.ts`
- [ ] T071 [US3] Implement POST `/cart/items/{itemId}/save-for-later` route in `backend/src/api/cart.routes.ts`
- [ ] T072 [US3] Implement frontend save-for-later service call in `frontend/src/services/cartService.ts`
- [ ] T073 [US3] Implement save-for-later action in `frontend/src/components/cart/CartItemRow.tsx`
- [ ] T074 [US3] Implement saved items list component in `frontend/src/components/cart/SavedItemsList.tsx`
- [ ] T075 [US3] Render saved items and empty saved state in `frontend/src/pages/CartPage.tsx`
- [ ] T076 [US3] Ensure saved items are excluded from totals in `frontend/src/components/cart/CartTotals.tsx`
- [ ] T077 [US3] Add save-for-later quickstart checks in `specs/001-shopping-cart/quickstart.md`

**Checkpoint**: User Story 3 is complete when saved items are separated from checkout
items, totals exclude saved items, accessibility checks pass, and all US3 tests pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete quality, performance, documentation, and release readiness across
all stories.

- [ ] T078 [P] Add cart API documentation notes in `specs/001-shopping-cart/contracts/cart-api.openapi.yaml`
- [ ] T079 [P] Add responsive cart layout refinements in `frontend/src/components/cart/cart.css`
- [ ] T080 [P] Add backend structured logging for cart mutations in `backend/src/services/cart.service.ts`
- [ ] T081 Add performance timing assertions for cart mutations in `backend/tests/integration/cart.performance.test.ts`
- [ ] T082 Add frontend responsiveness and loading-state tests in `frontend/tests/cart/CartPage.performance.test.tsx`
- [ ] T083 Add Playwright smoke test for update, merge, over-stock, and save-for-later flows in `frontend/tests/e2e/cart.spec.ts`
- [ ] T084 Run quickstart validation and record results in `specs/001-shopping-cart/quickstart.md`
- [ ] T085 Run final lint, unit, contract, integration, database, frontend, and smoke checks from `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and forms the MVP.
- **Phase 4 US2**: Depends on Phase 2; can begin after foundation, but benefits from
  US1 money and cart response helpers.
- **Phase 5 US3**: Depends on Phase 2; can begin after foundation, but benefits from
  US1 cart rendering and total helpers.
- **Phase 6 Polish**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 Update Item Quantity**: Independent after foundation.
- **US2 Merge Duplicate Cart Items**: Independent after foundation, with optional reuse
  of US1 cart totals and frontend cart row components.
- **US3 Save Item For Later**: Independent after foundation, with optional reuse of US1
  cart page state and totals components.

### Within Each User Story

- Tests must be written and fail before implementation.
- Repository changes precede service changes.
- Service changes precede route changes.
- API contract behavior precedes frontend service integration.
- Frontend service changes precede component/page integration.
- Story checkpoint must pass before moving to the next priority when working
  sequentially.

---

## Parallel Opportunities

- T004-T010 can run in parallel after T001-T003 are understood.
- T025-T030 can run in parallel after foundational app paths exist.
- US1 tests T031-T036 can run in parallel.
- US2 tests T047-T052 can run in parallel.
- US3 tests T063-T068 can run in parallel.
- Frontend components and backend route/service work can proceed in parallel within a
  story after contracts and shared types are stable.
- Polish tasks T078-T080 can run in parallel before final end-to-end verification.

---

## Parallel Example: User Story 1

```bash
Task: "T031 Add money precision unit tests in backend/tests/unit/money.service.test.ts"
Task: "T033 Add PATCH quantity contract tests in backend/tests/contract/cart.quantity.contract.test.ts"
Task: "T036 Add React quantity interaction tests in frontend/tests/cart/CartPage.quantity.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T047 Add merge duplicate service unit tests in backend/tests/unit/cart.service.merge.test.ts"
Task: "T049 Add POST add item contract tests in backend/tests/contract/cart.add-item.contract.test.ts"
Task: "T052 Add React stock rejection tests in frontend/tests/cart/CartPage.stock.test.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T063 Add save-for-later service unit tests in backend/tests/unit/cart.service.save-for-later.test.ts"
Task: "T064 Add save-for-later contract tests in backend/tests/contract/cart.save-for-later.contract.test.ts"
Task: "T067 Add React save-for-later interaction tests in frontend/tests/cart/CartPage.save-for-later.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundation.
3. Complete Phase 3 US1.
4. Validate quantity update, exact totals, contract, integration, database, and React
   tests.
5. Demo quantity update with product A at 100 baht changing from 1 to 3.

### Incremental Delivery

1. Deliver US1 for basic quantity updates and totals.
2. Deliver US2 for duplicate merge and stock rejection.
3. Deliver US3 for save-for-later behavior.
4. Run cross-cutting performance, accessibility, quickstart, and smoke checks.

### Team Parallel Strategy

1. One engineer completes backend foundation while another completes frontend/test
   foundation.
2. After Phase 2, split by story or layer:
   - Backend: repository, service, routes, database tests.
   - Frontend: service boundary, cart page, row components, interaction tests.
   - QA: contract, quickstart, and smoke test validation.

---

## Notes

- Tests are required and must fail before story implementation begins.
- Preserve the existing cart state on stock rejection.
- Use integer minor units for all money calculations.
- Keep one active row per SKU per cart.
- Saved items must not affect checkout totals.
