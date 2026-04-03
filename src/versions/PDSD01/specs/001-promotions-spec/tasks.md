---

description: "Task list for Promotions and Discounts implementation"
---

# Tasks: Promotions and Discounts

**Input**: Design documents from `/specs/001-promotions-spec/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are required per constitution; include unit and integration tasks.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create pricing module directories in backend/src/pricing/ and backend/tests/ subfolders
- [x] T002 [P] Add frontend checkout placeholder components in frontend/src/components/Checkout/
- [x] T003 [P] Add frontend promo service stub in frontend/src/services/promotions.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define pricing evaluation interface in backend/src/pricing/evaluator.py
- [x] T005 [P] Add shared discount calculation helpers in backend/src/pricing/calculations.py
- [x] T006 [P] Add shared messaging helpers in backend/src/pricing/messages.py
- [x] T007 Add discount application ordering rules in backend/src/pricing/rules.py
- [x] T008 [P] Add backend-to-frontend DTO mapping in backend/src/services/pricing_dto.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Apply Valid Coupon (Priority: P1) 🎯 MVP

**Goal**: Apply valid fixed-amount coupons with minimum spend checks.

**Independent Test**: Apply a valid coupon and confirm total reduction and success message.

### Tests for User Story 1

- [x] T009 [P] [US1] Unit tests for minimum spend validation in backend/tests/unit/test_coupon_validation.py
- [x] T010 [P] [US1] Unit tests for fixed-amount discount application in backend/tests/unit/test_coupon_discount.py
- [x] T011 [P] [US1] Integration test for successful coupon apply in backend/tests/integration/test_coupon_apply.py
- [x] T012 [P] [US1] Frontend test for coupon apply UI in frontend/tests/checkout/coupon-apply.test.ts

### Implementation for User Story 1

- [x] T013 [P] [US1] Implement coupon validation logic in backend/src/pricing/coupons.py
- [x] T014 [US1] Implement fixed-amount discount application in backend/src/pricing/evaluator.py
- [x] T015 [US1] Surface success messaging in backend/src/pricing/messages.py
- [x] T016 [US1] Implement coupon apply UI in frontend/src/components/Checkout/CouponApply.tsx
- [x] T017 [US1] Wire coupon apply to service in frontend/src/services/promotions.ts

**Checkpoint**: User Story 1 is functional and testable independently

---

## Phase 4: User Story 2 - Cart Total Percentage Discount (Priority: P2)

**Goal**: Calculate cart-level percentage discounts and show line items.

**Independent Test**: Apply a percentage promotion and verify line item and total.

### Tests for User Story 2

- [x] T018 [P] [US2] Unit tests for percentage calculation in backend/tests/unit/test_percentage_discount.py
- [x] T019 [P] [US2] Integration test for percentage promo in backend/tests/integration/test_percentage_promo.py
- [x] T020 [P] [US2] Frontend test for discount line items in frontend/tests/checkout/discount-lines.test.ts

### Implementation for User Story 2

- [x] T021 [P] [US2] Implement percentage promotion evaluation in backend/src/pricing/promotions.py
- [x] T022 [US2] Apply percentage discounts before fixed discounts in backend/src/pricing/rules.py
- [x] T023 [US2] Add discount line item assembly in backend/src/pricing/evaluator.py
- [x] T024 [US2] Render discount line items in frontend/src/components/Checkout/DiscountLines.tsx
- [x] T025 [US2] Update checkout totals view in frontend/src/pages/Checkout.tsx

**Checkpoint**: User Story 2 is functional and testable independently

---

## Phase 5: User Story 3 - Promotion Rules and Safe Totals (Priority: P3)

**Goal**: Enforce expiration, usage limits, and non-negative totals.

**Independent Test**: Apply expired and reused coupons and verify rejection and totals.

### Tests for User Story 3

- [x] T026 [P] [US3] Unit tests for expiration checks in backend/tests/unit/test_coupon_expiration.py
- [x] T027 [P] [US3] Unit tests for usage limit checks in backend/tests/unit/test_coupon_usage.py
- [x] T028 [P] [US3] Unit tests for non-negative total clamp in backend/tests/unit/test_total_clamp.py
- [x] T029 [P] [US3] Integration tests for invalid coupons in backend/tests/integration/test_invalid_coupons.py
- [x] T030 [P] [US3] Frontend test for error messaging in frontend/tests/checkout/coupon-errors.test.ts

### Implementation for User Story 3

- [x] T031 [P] [US3] Implement expiration checks in backend/src/pricing/coupons.py
- [x] T032 [P] [US3] Implement usage history lookup in backend/src/pricing/usage.py
- [x] T033 [US3] Enforce non-negative totals in backend/src/pricing/evaluator.py
- [x] T034 [US3] Add error messaging for rejected coupons in backend/src/pricing/messages.py
- [x] T035 [US3] Render coupon error states in frontend/src/components/Checkout/CouponApply.tsx

**Checkpoint**: User Story 3 is functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T036 [P] Update documentation in specs/001-promotions-spec/quickstart.md
- [x] T037 [P] Add performance checks or benchmarks in backend/tests/integration/test_pricing_performance.py
- [x] T038 [P] Validate frontend UX consistency in frontend/src/components/Checkout/
- [x] T039 [P] Add lint/format configuration validation in backend and frontend config files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
  - User stories can proceed in parallel after foundational tasks complete
  - Recommended sequence: P1 → P2 → P3
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase - no dependencies
- **User Story 2 (P2)**: Can start after Foundational phase - independent
- **User Story 3 (P3)**: Can start after Foundational phase - independent

### Within Each User Story

- Tests MUST be written and fail before implementation
- Validation logic before evaluator integration
- Evaluator integration before messaging and totals assembly

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Foundational tasks T005, T006, and T008 can run in parallel
- Unit tests within each story can run in parallel
- Implementations within different stories can be parallelized after Phase 2

---

## Parallel Example: User Story 1

```bash
# In parallel:
# 1) Write unit tests for validation and discount calculation (backend)
# 2) Write integration test for coupon apply (backend)
# 3) Implement coupon apply UI (frontend)
```
