# Tasks: Shopping Cart Scenarios

**Input**: Design documents from `/specs/001-cart-spec/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are REQUIRED for all new behavior and bug fixes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create module directories `src/cart` and `src/lib`
- [x] T002 Create test directories `tests/unit` and `tests/integration`
- [x] T003 [P] Add package markers in `src/cart/__init__.py` and `src/lib/__init__.py`
- [x] T004 [P] Add pytest configuration in `pyproject.toml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 Implement money value handling in `src/lib/money.py` (minor units + formatting)
- [x] T006 Define domain error types in `src/cart/errors.py` (e.g., insufficient stock, item not found)
- [x] T007 Implement core cart data models in `src/cart/models.py` (Cart, CartItem, SavedItem)
- [x] T008 Implement total calculation helpers in `src/cart/totals.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Update Item Quantity (Priority: P1) 🎯 MVP

**Goal**: Update quantities and recalculate line and cart totals accurately

**Independent Test**: Change quantity for a single item and verify totals update immediately

### Tests for User Story 1 (REQUIRED) ⚠️

- [x] T009 [P] [US1] Unit tests for money precision in `tests/unit/test_money.py`
- [x] T010 [P] [US1] Unit tests for totals recalculation in `tests/unit/test_cart_totals.py`
- [x] T011 [P] [US1] Integration test for quantity update workflow in `tests/integration/test_cart_workflows.py`

### Implementation for User Story 1

- [x] T012 [US1] Implement quantity update logic in `src/cart/service.py`
- [x] T013 [US1] Wire totals recomputation after quantity change in `src/cart/totals.py`
- [x] T014 [US1] Validate quantity update behavior with error handling in `src/cart/service.py`

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Merge Duplicate Items on Add (Priority: P2)

**Goal**: Adding a duplicate SKU merges quantities into one cart line

**Independent Test**: Add the same SKU twice and verify only one line item exists

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T015 [P] [US2] Unit tests for merge behavior in `tests/unit/test_cart_models.py`
- [x] T016 [P] [US2] Integration test for add-and-merge workflow in `tests/integration/test_cart_workflows.py`

### Implementation for User Story 2

- [x] T017 [US2] Implement add-item merge logic in `src/cart/service.py`
- [x] T018 [US2] Enforce stock validation on add in `src/cart/service.py`

**Checkpoint**: User Stories 1 and 2 work independently

---

## Phase 5: User Story 3 - Save for Later (Priority: P3)

**Goal**: Move items from active cart to saved list and exclude from totals

**Independent Test**: Save an item and verify it appears in saved list and is excluded from totals

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T019 [P] [US3] Unit tests for save-for-later behavior in `tests/unit/test_cart_models.py`
- [x] T020 [P] [US3] Integration test for save-for-later workflow in `tests/integration/test_cart_workflows.py`

### Implementation for User Story 3

- [x] T021 [US3] Implement save-for-later transition in `src/cart/service.py`
- [x] T022 [US3] Update totals exclusion for saved items in `src/cart/totals.py`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T023 [P] Update quickstart validation steps in `specs/001-cart-spec/quickstart.md`
- [x] T024 [P] Add performance budget verification notes in `specs/001-cart-spec/plan.md`
- [x] T025 [P] Run UX consistency review checklist in `specs/001-cart-spec/quickstart.md`
- [x] T026 Run full test suite with `pytest`

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before workflow integration

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Tests for a user story marked [P] can run in parallel
- Unit tests across stories can run in parallel if files do not overlap

---

## Parallel Example: User Story 1

```bash
# Launch unit tests together (after writing them):
Task: "Unit tests for money precision in tests/unit/test_money.py"
Task: "Unit tests for totals recalculation in tests/unit/test_cart_totals.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and validate User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo MVP
3. Add User Story 2 → Test independently → Demo
4. Add User Story 3 → Test independently → Demo
