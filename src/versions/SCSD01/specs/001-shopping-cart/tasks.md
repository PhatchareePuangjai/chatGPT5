# Tasks: Shopping Cart Core Behaviors

**Input**: Design documents from `specs/001-shopping-cart/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED by constitution. Each user story includes tests that must be written first and fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Each task includes exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish project skeleton, tooling, and baseline CI commands.

- [ ] T001 Create repo source structure per plan: `backend/src/{api,models,services,lib}`, `backend/tests/{unit,integration,contract}`, `frontend/src/{components,pages,services}`, `frontend/tests`
- [ ] T002 [P] Add backend package manifest and scripts in `backend/package.json` (dev/test/lint)
- [ ] T003 [P] Add frontend package manifest and scripts in `frontend/package.json` (dev/test/lint)
- [ ] T004 [P] Configure formatting/linting (backend) in `backend/.eslintrc.*` and `backend/.prettierrc`
- [ ] T005 [P] Configure formatting/linting (frontend) in `frontend/.eslintrc.*` and `frontend/.prettierrc`
- [ ] T006 [P] Add shared editor config in `.editorconfig`
- [ ] T007 [P] Add environment config templates: `backend/.env.example` and `frontend/.env.example`
- [ ] T008 [P] Add backend test harness bootstrap in `backend/tests/testSetup.ts`
- [ ] T009 [P] Add frontend test harness bootstrap in `frontend/tests/testSetup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before any user story can ship.

- [ ] T010 Define database schema for carts, cart_items, inventory_items in `backend/src/models/schema.sql`
- [ ] T011 Implement DB migration runner/wrapper in `backend/src/lib/migrations.ts` (apply migrations at startup/test)
- [ ] T012 Create data access layer helpers in `backend/src/lib/db.ts` (connection pool, transactions)
- [ ] T013 Implement money type utilities using minor units in `backend/src/lib/money.ts` (parse/format, multiply, sum)
- [ ] T014 Create core domain types in `backend/src/models/cart.ts` and `backend/src/models/cartItem.ts`
- [ ] T015 Implement inventory access in `backend/src/services/inventoryService.ts` (getStockBySku)
- [ ] T016 Implement cart read service in `backend/src/services/cartReadService.ts` (getCart with active/saved separation + totals)
- [ ] T017 Implement structured logging with request correlation in `backend/src/lib/logger.ts` and middleware in `backend/src/api/middleware/requestContext.ts`
- [ ] T018 Add error model + mapping to user-safe messages in `backend/src/api/errors.ts` (including INSUFFICIENT_STOCK -> "สินค้าไม่เพียงพอ")
- [ ] T019 Create cart API routes skeleton in `backend/src/api/cart.routes.ts` and wire into server in `backend/src/api/server.ts`
- [ ] T020 Add integration test DB fixture helpers in `backend/tests/integration/dbFixtures.ts` (seed cart/items/inventory)

**Checkpoint**: Foundation ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Update Item Quantity (Priority: P1) MVP

**Goal**: Shoppers can set quantity for an existing cart item and totals update correctly and immediately.

**Independent Test**: With a seeded cart and item A (100.00), setting quantity to 3 yields line total 300.00 and correct grand total.

### Tests for User Story 1 (REQUIRED) ⚠️

- [ ] T021 [P] [US1] Write backend contract test for `PATCH /cart/items/{sku}` in `backend/tests/contract/cart.updateQuantity.test.ts`
- [ ] T022 [P] [US1] Write backend integration test for quantity update + totals in `backend/tests/integration/cart.updateQuantity.test.ts`
- [ ] T023 [P] [US1] Write unit tests for money arithmetic (100.00*3 and 19.99*3) in `backend/tests/unit/money.test.ts`
- [ ] T024 [P] [US1] Write frontend integration test for quantity update UX in `frontend/tests/cart.updateQuantity.test.tsx`

### Implementation for User Story 1

- [ ] T025 [US1] Implement cart mutation service `setItemQuantity(sku, quantity)` in `backend/src/services/cartMutationService.ts` (enforce stock, recompute totals)
- [ ] T026 [US1] Implement API handler for quantity update in `backend/src/api/handlers/updateItemQuantity.ts`
- [ ] T027 [US1] Wire `PATCH /cart/items/:sku` route in `backend/src/api/cart.routes.ts` to handler (uses request context + error mapping)
- [ ] T028 [P] [US1] Implement cart UI page skeleton in `frontend/src/pages/CartPage.tsx` (Active list, Saved list, grand total)
- [ ] T029 [P] [US1] Implement quantity control component in `frontend/src/components/QuantityControl.tsx` (keyboard operable)
- [ ] T030 [US1] Implement cart API client in `frontend/src/services/cartApi.ts` (getCart, patchQuantity)
- [ ] T031 [US1] Connect UI to backend: load cart, render totals, patch quantity, update UI state in `frontend/src/pages/CartPage.tsx`
- [ ] T032 [US1] Implement frontend error UX for insufficient stock in `frontend/src/components/InlineError.tsx` and use in `frontend/src/pages/CartPage.tsx`

**Checkpoint**: US1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Merge Duplicate Add-To-Cart Items (Priority: P2)

**Goal**: Adding the same SKU merges quantities into the existing cart line without duplicates and enforces stock limits.

**Independent Test**: With SKU-001 quantity 1 in cart, adding 2 results in exactly one row with quantity 3; overstock is rejected with state preserved.

### Tests for User Story 2 (REQUIRED) ⚠️

- [ ] T033 [P] [US2] Write backend contract test for `POST /cart/items` merge behavior in `backend/tests/contract/cart.addItemMerge.test.ts`
- [ ] T034 [P] [US2] Write backend integration test for merge + stock rejection in `backend/tests/integration/cart.addItemMerge.test.ts`
- [ ] T035 [P] [US2] Write frontend integration test for add-to-cart merge UX in `frontend/tests/cart.addItemMerge.test.tsx`

### Implementation for User Story 2

- [ ] T036 [US2] Implement cart mutation `addItem(sku, quantity)` merge logic in `backend/src/services/cartMutationService.ts`
- [ ] T037 [US2] Implement API handler for add-to-cart in `backend/src/api/handlers/addToCart.ts`
- [ ] T038 [US2] Wire `POST /cart/items` route in `backend/src/api/cart.routes.ts`
- [ ] T039 [US2] Add frontend "Add to cart" integration path in `frontend/src/services/cartApi.ts` and a minimal entry point in `frontend/src/pages/ProductPageMock.tsx` for testing merge behavior

**Checkpoint**: US2 works independently and does not break US1.

---

## Phase 5: User Story 3 - Save For Later (Priority: P3)

**Goal**: Shoppers can move an item from Active to Saved; it disappears from checkout list and no longer affects totals.

**Independent Test**: With SKU-005 Active, saving moves it to Saved list and decreases grand total accordingly.

### Tests for User Story 3 (REQUIRED) ⚠️

- [ ] T040 [P] [US3] Write backend contract test for `POST /cart/items/{sku}/save` in `backend/tests/contract/cart.saveForLater.test.ts`
- [ ] T041 [P] [US3] Write backend integration test for save-for-later + totals in `backend/tests/integration/cart.saveForLater.test.ts`
- [ ] T042 [P] [US3] Write frontend integration test for save-for-later UX in `frontend/tests/cart.saveForLater.test.tsx`

### Implementation for User Story 3

- [ ] T043 [US3] Implement cart mutation `saveForLater(sku)` in `backend/src/services/cartMutationService.ts`
- [ ] T044 [US3] Implement API handler for save-for-later in `backend/src/api/handlers/saveForLater.ts`
- [ ] T045 [US3] Wire `POST /cart/items/:sku/save` route in `backend/src/api/cart.routes.ts`
- [ ] T046 [US3] Add UI action "Save for later" in `frontend/src/pages/CartPage.tsx` and ensure item moves lists and totals update

**Checkpoint**: US3 works independently and preserves all prior stories.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality, performance, accessibility, and operational hardening.

- [ ] T047 [P] Add DB indexes for cart hot paths in `backend/src/models/schema.sql` (cart_id+status, cart_id+sku+status, inventory sku)
- [ ] T048 Add request/response timing logs for cart mutations in `backend/src/api/middleware/requestTiming.ts`
- [ ] T049 [P] Add empty/loading state UX in `frontend/src/pages/CartPage.tsx`
- [ ] T050 [P] Accessibility pass: focus management and aria labels for quantity controls in `frontend/src/components/QuantityControl.tsx`
- [ ] T051 [P] Add documentation updates to `specs/001-shopping-cart/quickstart.md` to reflect actual run commands once scripts exist

---

## Dependencies & Execution Order

- Phase 1 (Setup) -> Phase 2 (Foundational) -> US1 -> US2 -> US3 -> Polish
- US2 depends on shared mutation service built in US1/foundation.
- US3 depends on shared mutation service built in US1/foundation.

## Parallel Opportunities

- Setup tasks T002-T009 can be done in parallel.
- Foundational tasks T010-T020 have parallel slices (schema, money utils, logging, route skeleton, fixtures) once DB wrapper exists.
- Within each user story, contract/integration/frontend tests are parallelizable ([P]) before implementation begins.

