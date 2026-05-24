---

description: "Tasks for Shopping Cart Core Behaviors"
---

# Tasks: Shopping Cart Core Behaviors

**Input**: Design documents from `specs/001-shopping-cart/`

**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by the project constitution (acceptance scenarios must map to automated tests).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and repository structure per `plan.md`

- [x] T001 Create project directories per plan in `backend/` and `frontend/`
- [x] T002 Initialize backend Node/TS project in `backend/package.json` and `backend/tsconfig.json`
- [x] T003 Initialize frontend React project in `frontend/package.json` and `frontend/tsconfig.json`
- [x] T004 [P] Configure formatting + linting for backend in `backend/.eslintrc.*` and `backend/.prettierrc*`
- [x] T005 [P] Configure formatting + linting for frontend in `frontend/.eslintrc.*` and `frontend/.prettierrc*`
- [x] T006 [P] Add test runner setup for backend in `backend/tests/` (unit + integration harness)
- [x] T007 [P] Add test runner setup for frontend in `frontend/tests/` (component/unit harness)
- [x] T008 Add shared dev scripts (start/test/lint) in `backend/package.json` and `frontend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared foundations required before any user story implementation

- [x] T009 Define DB migration framework and baseline schema in `backend/src/db/migrations/` (cart, cart_items, saved_items, products, inventory)
- [x] T010 [P] Implement database connection and query helper in `backend/src/db/index.ts`
- [x] T011 Implement repositories for reading/writing cart entities in `backend/src/db/repos/cartRepo.ts`
- [x] T012 Implement repositories for product price + inventory reads in `backend/src/db/repos/productRepo.ts`
- [x] T013 Implement money utilities using minor units in `backend/src/domain/money.ts`
- [x] T014 Implement stock validation helper in `backend/src/domain/stock.ts`
- [x] T015 Implement backend error model + mapper in `backend/src/api/errors.ts` (includes `INSUFFICIENT_STOCK`)
- [x] T016 Implement request validation middleware in `backend/src/middleware/validate.ts`
- [x] T017 Implement API router scaffold in `backend/src/api/router.ts` and app bootstrap in `backend/src/index.ts`
- [x] T018 Implement frontend API client wrapper in `frontend/src/services/http.ts`
- [x] T019 Implement frontend cart API client in `frontend/src/services/cartApi.ts` aligned to `specs/001-shopping-cart/contracts/http-api.md`

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Update Item Quantity (Priority: P1) MVP

**Goal**: Users can update item quantities and see correct line totals and grand total immediately.

**Independent Test**: Add one item, update quantity, verify quantity/line/grand totals match expected values (including money precision).

### Tests for User Story 1

- [x] T020 [P] [US1] Unit test money math (19.99 * 3 = 59.97) in `backend/tests/unit/money.test.ts`
- [x] T021 [P] [US1] Unit test cart totals recompute in `backend/tests/unit/cartMath.test.ts`
- [x] T022 [US1] Integration test PATCH quantity happy path in `backend/tests/integration/cartQuantity.test.ts`
- [x] T023 [US1] Frontend component test totals update in `frontend/tests/cartTotals.test.tsx`

### Implementation for User Story 1

- [x] T024 [P] [US1] Implement cart total computation in `backend/src/domain/cartTotals.ts`
- [x] T025 [US1] Implement PATCH `/cart/items/:sku` handler in `backend/src/api/cartRoutes.ts`
- [x] T026 [US1] Implement cart service method `setItemQty` in `backend/src/services/cartService.ts` (uses stock + repos)
- [x] T027 [US1] Wire routes into app in `backend/src/api/router.ts`
- [x] T028 [P] [US1] Build cart state store in `frontend/src/state/cartStore.ts`
- [x] T029 [P] [US1] Build cart UI components in `frontend/src/components/CartItemRow.tsx` and `frontend/src/components/CartTotals.tsx`
- [x] T030 [US1] Build cart page and wire quantity update to API in `frontend/src/pages/CartPage.tsx`

**Checkpoint**: US1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Merge Duplicate Items (Priority: P2)

**Goal**: Adding an existing SKU merges quantities into a single active cart line (no duplicate rows), enforcing stock.

**Independent Test**: Add SKU-001 qty 1, then add SKU-001 qty 2 from product page; verify single line qty 3, and stock enforcement.

### Tests for User Story 2

- [x] T031 [US2] Integration test POST add merges existing row in `backend/tests/integration/cartAddMerge.test.ts`
- [x] T032 [US2] Integration test add rejects when stock exceeded and cart unchanged in `backend/tests/integration/cartAddStockFail.test.ts`

### Implementation for User Story 2

- [x] T033 [US2] Implement POST `/cart/items` handler in `backend/src/api/cartRoutes.ts`
- [x] T034 [US2] Implement cart service method `addItem` merge semantics in `backend/src/services/cartService.ts`
- [x] T035 [US2] Update frontend add-to-cart flow to call API in `frontend/src/services/cartApi.ts` and `frontend/src/state/cartStore.ts`
- [x] T036 [US2] Ensure cart UI does not render duplicate SKU rows in `frontend/src/pages/CartPage.tsx`

**Checkpoint**: US2 works independently and does not break US1

---

## Phase 5: User Story 3 - Save For Later (Priority: P3)

**Goal**: Users can move an active item to saved-for-later; active totals update and saved list is visible.

**Independent Test**: Add an item, save it for later, verify it leaves active list, appears in saved list, and totals decrease.

### Tests for User Story 3

- [x] T037 [US3] Integration test save-for-later moves item and updates totals in `backend/tests/integration/cartSaveForLater.test.ts`
- [x] T038 [US3] Frontend component test saved list behavior in `frontend/tests/saveForLater.test.tsx`

### Implementation for User Story 3

- [x] T039 [US3] Implement saved item repo operations in `backend/src/db/repos/cartRepo.ts`
- [x] T040 [US3] Implement POST `/cart/items/:sku/save` handler in `backend/src/api/cartRoutes.ts`
- [x] T041 [US3] Implement cart service method `saveForLater` in `backend/src/services/cartService.ts`
- [x] T042 [P] [US3] Build saved items UI in `frontend/src/components/SavedItemsList.tsx`
- [x] T043 [US3] Wire save-for-later action from cart UI in `frontend/src/pages/CartPage.tsx`

**Checkpoint**: US3 works independently and does not break US1/US2

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, consistency, and performance verification across all stories

- [x] T044 Add consistent user-facing error messages for stock failures in `frontend/src/pages/CartPage.tsx`
- [x] T045 Add backend request logging + correlation id baseline in `backend/src/middleware/logging.ts`
- [x] T046 Validate DB constraints/indexes for `(cart_id, sku)` uniqueness and inventory lookups in `backend/src/db/migrations/`
- [x] T047 Add contract sanity tests for `GET /cart` response shape in `backend/tests/integration/cartGet.test.ts`
- [x] T048 Run `specs/001-shopping-cart/quickstart.md` as a verification checklist and update notes in `specs/001-shopping-cart/quickstart.md`

---

## Dependencies & Execution Order

- Setup (Phase 1) must complete before Foundational (Phase 2).
- Foundational (Phase 2) blocks all user story work.
- US1 is the MVP and should be implemented first.
- US2 and US3 depend on shared cart service + repos, but should remain independently testable once implemented.

## Parallel Opportunities

- T004 and T005 can run in parallel (lint/format backend vs frontend).
- T006 and T007 can run in parallel (backend vs frontend test setup).
- Within US1, T028 and T029 can run in parallel (state store vs UI components) once API wiring exists.

## Implementation Strategy

1. Complete Phase 1 + Phase 2.
2. Implement US1 end-to-end (tests + backend + frontend), stop and validate.
3. Implement US2, validate merge + stock failure behavior.
4. Implement US3, validate totals and saved list behavior.
5. Finish polish tasks and ensure all tests pass in CI.
