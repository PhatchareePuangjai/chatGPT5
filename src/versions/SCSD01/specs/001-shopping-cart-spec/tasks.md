---

description: "Task list template for feature implementation"
---

# Tasks: Shopping Cart Scenarios (Core + Front-End UI)

**Input**: Design documents from `/specs/001-shopping-cart-spec/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create source, frontend, and test directories per plan in `src/`, `frontend/`, and `tests/`
- [X] T002 [P] Add money utility skeleton in `src/lib/money.py`
- [X] T003 [P] Add cart model skeletons in `src/models/cart.py` and `src/models/cart_item.py`
- [X] T004 [P] Add service skeletons in `src/services/cart_service.py` and `src/services/inventory_service.py`
- [X] T005 [P] Add frontend scaffolding files in `frontend/index.html`, `frontend/styles.css`, and `frontend/app.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement integer-cents money type and formatting in `src/lib/money.py`
- [X] T007 Implement inventory snapshot and stock check logic in `src/services/inventory_service.py`
- [X] T008 Implement cart item model (status, line total rules) in `src/models/cart_item.py`
- [X] T009 Implement cart model totals recalculation in `src/models/cart.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Update Item Quantity (Priority: P1) 

**Goal**: Update cart item quantities and totals accurately

**Independent Test**: Update an item quantity and verify line total and cart total update correctly

### Implementation for User Story 1

- [X] T010 [US1] Implement quantity update operation in `src/services/cart_service.py`
- [X] T011 [US1] Enforce stock validation on quantity update in `src/services/cart_service.py`
- [X] T012 [US1] Update cart total recalculation on quantity change in `src/models/cart.py`
- [X] T013 [US1] Wire quantity controls to cart update in `frontend/app.js`
- [X] T014 [US1] Render line totals and cart total in `frontend/index.html`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Merge Duplicate Items (Priority: P2)

**Goal**: Merge duplicate SKU additions into a single cart line while respecting stock limits

**Independent Test**: Add the same SKU twice and verify a single row with summed quantity or a stock warning

### Implementation for User Story 2

- [X] T015 [US2] Implement add-to-cart merge logic by SKU in `src/services/cart_service.py`
- [X] T016 [US2] Recalculate line and cart totals after merge in `src/models/cart.py`
- [X] T017 [US2] Return stock error with message "สินค้าไม่เพียงพอ" in `src/services/cart_service.py`
- [X] T018 [US2] Add UI flow for duplicate add and stock warning in `frontend/app.js`
- [X] T019 [US2] Display stock warning banner in `frontend/index.html`

**Checkpoint**: User Story 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Save for Later (Priority: P3)

**Goal**: Move items from active cart to saved list and update totals

**Independent Test**: Save an item for later and verify removal from active totals and presence in saved list

### Implementation for User Story 3

- [X] T020 [US3] Implement save-for-later operation in `src/services/cart_service.py`
- [X] T021 [US3] Mark item status as SAVED and exclude from totals in `src/models/cart_item.py`
- [X] T022 [US3] Update cart summary output to include saved items in `src/models/cart.py`
- [X] T023 [US3] Add saved-items list rendering in `frontend/index.html`
- [X] T024 [US3] Wire save-for-later UI action in `frontend/app.js`

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T025 [P] Align UI text and messages with contract in `specs/001-shopping-cart-spec/contracts/cart-ui.md`
- [X] T026 [P] Validate quickstart steps against implementation in `specs/001-shopping-cart-spec/quickstart.md`
- [X] T027 [P] Documentation updates in `specs/001-shopping-cart-spec/plan.md`

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

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but shares cart domain
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 but shares cart domain

### Within Each User Story

- Models before services
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel where file conflicts are avoided
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)

---

## Parallel Example: User Story 1

```bash
Task: "Implement quantity update operation in src/services/cart_service.py"
Task: "Wire quantity controls to cart update in frontend/app.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Validate US1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Validate independently
3. Add User Story 2 → Validate independently
4. Add User Story 3 → Validate independently

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing (if tests added later)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
