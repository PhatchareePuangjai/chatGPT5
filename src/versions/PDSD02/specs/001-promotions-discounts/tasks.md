---
description: "Tasks for Promotions and Discounts"
---

# Tasks: Promotions and Discounts

**Input**: Design documents from `specs/001-promotions-discounts/`

**Prerequisites**: `specs/001-promotions-discounts/plan.md` (required), `specs/001-promotions-discounts/spec.md` (required), `specs/001-promotions-discounts/research.md`, `specs/001-promotions-discounts/data-model.md`, `specs/001-promotions-discounts/contracts/`

**Tests**: Per the project constitution, tests are REQUIRED for behavior changes. Only doc-only changes may omit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create web app structure `backend/` + `frontend/` per `specs/001-promotions-discounts/plan.md`
- [ ] T002 [P] Add backend Node+TS scaffolding in `backend/package.json`
- [ ] T003 [P] Add frontend React scaffolding in `frontend/package.json`
- [ ] T004 [P] Configure shared formatting/lint rules in `backend/.eslintrc.*`, `backend/.prettierrc*`, `frontend/.eslintrc.*`, `frontend/.prettierrc*`
- [ ] T005 [P] Add backend test runner config in `backend/jest.config.*` (or equivalent)
- [ ] T006 [P] Add frontend test runner config in `frontend/vitest.config.*` (or equivalent)
- [ ] T007 [P] Add CI-local scripts to run lint/tests in `backend/package.json` and `frontend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Setup environment configuration in `backend/src/config/env.ts` (DB URL, app port, node env)
- [ ] T009 Setup Express app bootstrap in `backend/src/app.ts` and server entry in `backend/src/server.ts`
- [ ] T010 Setup API routing skeleton in `backend/src/api/index.ts`
- [ ] T011 Setup consistent error handling middleware in `backend/src/api/middleware/errorHandler.ts`
- [ ] T012 Setup request validation helper in `backend/src/api/middleware/validate.ts`
- [ ] T013 Create money utilities using integer satang in `backend/src/lib/money.ts`
- [ ] T014 Create promotion engine types (discount lines, inputs/outputs) in `backend/src/services/promotions/types.ts`
- [ ] T015 Create promotion engine core function skeleton in `backend/src/services/promotions/engine.ts`
- [ ] T016 Setup database migrations framework in `backend/src/db/migrations/README.md` (and chosen tool config)
- [ ] T017 Setup DB connection module in `backend/src/db/index.ts`
- [ ] T018 Create initial schema migration for coupons/promotions/redemptions/orders in `backend/src/db/migrations/001_promotions.sql`
- [ ] T019 Add DB constraints (unique coupon code, unique one-time redemption per user, grand total >= 0) in `backend/src/db/migrations/001_promotions.sql`
- [ ] T020 Add backend integration test harness (app bootstrap + DB test helpers) in `backend/tests/helpers/testApp.ts` and `backend/tests/helpers/testDb.ts`
- [ ] T021 Add seed/test fixtures helpers in `backend/tests/helpers/fixtures.ts`
- [ ] T022 Add frontend API client wrapper in `frontend/src/services/apiClient.ts`
- [ ] T023 Add frontend checkout totals model/types in `frontend/src/services/checkoutTypes.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Apply Coupon Code (Priority: P1) 🎯 MVP

**Goal**: User can apply a coupon at checkout; system validates min spend and expiry; totals update and show a success/failure message.

**Independent Test**: Using only this increment, a tester can:
- Apply "SAVE100" on a 1,000 THB cart (min spend 500) and see grand total 900 and message "ใช้คูปองสำเร็จ"
- Apply "EXPIRED" and see rejection, totals unchanged, message "คูปองหมดอายุ"

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T024 [P] [US1] Contract test for `POST /checkout/apply-coupon` in `backend/tests/contract/applyCoupon.contract.test.ts`
- [ ] T025 [P] [US1] Integration test: valid coupon "SAVE100" path in `backend/tests/integration/applyCoupon.success.test.ts`
- [ ] T026 [P] [US1] Integration test: expired coupon rejection path in `backend/tests/integration/applyCoupon.expired.test.ts`

### Implementation for User Story 1

- [ ] T027 [P] [US1] Create coupon data access functions in `backend/src/models/couponRepo.ts`
- [ ] T028 [P] [US1] Create coupon validation logic (min spend, expiry) in `backend/src/services/promotions/couponValidation.ts`
- [ ] T029 [US1] Implement coupon application in promotion engine in `backend/src/services/promotions/engine.ts` (depends on T013, T014, T028)
- [ ] T030 [P] [US1] Add API route handler `POST /checkout/apply-coupon` in `backend/src/api/routes/checkoutApplyCoupon.ts`
- [ ] T031 [US1] Wire route into API router in `backend/src/api/index.ts`
- [ ] T032 [P] [US1] Implement response message mapping ("ใช้คูปองสำเร็จ", "คูปองหมดอายุ") in `backend/src/services/promotions/messages.ts`
- [ ] T033 [P] [US1] Add frontend coupon input component in `frontend/src/components/CouponInput.tsx`
- [ ] T034 [P] [US1] Add frontend apply-coupon service call in `frontend/src/services/checkoutApi.ts`
- [ ] T035 [US1] Add frontend checkout totals view wiring (show discount lines + message) in `frontend/src/pages/CheckoutPage.tsx`
- [ ] T036 [P] [US1] Frontend component test for coupon success UI in `frontend/tests/CouponInput.success.test.tsx`
- [ ] T037 [P] [US1] Frontend component test for coupon expired UI in `frontend/tests/CouponInput.expired.test.tsx`

**Checkpoint**: User Story 1 is functional and testable independently

---

## Phase 4: User Story 2 - Cart Total Percentage Discount (Priority: P2)

**Goal**: Cart-level percentage promotions are calculated correctly and displayed as a separate discount line item.

**Independent Test**: A tester can create a 2,000 THB cart with a 10% cart promotion and verify a 200 THB discount and grand total 1,800 THB with a visible discount line.

### Tests for User Story 2 ⚠️

- [ ] T038 [P] [US2] Contract test for `GET /checkout/totals` in `backend/tests/contract/getTotals.contract.test.ts`
- [ ] T039 [P] [US2] Integration test: 10% cart promotion totals in `backend/tests/integration/getTotals.percentPromo.test.ts`

### Implementation for User Story 2

- [ ] T040 [P] [US2] Create promotions data access functions in `backend/src/models/promotionRepo.ts`
- [ ] T041 [US2] Implement percent promotion calculation (basis points + rounding) in `backend/src/services/promotions/engine.ts` (percent-first rule)
- [ ] T042 [P] [US2] Add API route handler `GET /checkout/totals` in `backend/src/api/routes/checkoutTotals.ts`
- [ ] T043 [US2] Wire totals route into API router in `backend/src/api/index.ts`
- [ ] T044 [P] [US2] Update frontend totals fetch in `frontend/src/services/checkoutApi.ts`
- [ ] T045 [US2] Update frontend totals UI to render promotion discount line items in `frontend/src/pages/CheckoutPage.tsx`
- [ ] T046 [P] [US2] Frontend component test for discount line display in `frontend/tests/CheckoutPage.discountLines.test.tsx`

**Checkpoint**: User Stories 1 AND 2 work independently

---

## Phase 5: User Story 3 - Correct Discount Rules and Safeguards (Priority: P3)

**Goal**: Enforce per-user coupon usage limits, deterministic order-of-operations, and negative-total protection.

**Independent Test**: A tester can verify:
- Reusing one-time coupon is rejected with message "คุณใช้สิทธิ์ครบแล้ว"
- 10% then 100 THB yields 800 THB (not 810 THB)
- Discounts never produce a negative grand total (clamped to 0)

### Tests for User Story 3 ⚠️

- [ ] T047 [P] [US3] Integration test: one-time coupon reuse rejected in `backend/tests/integration/applyCoupon.usageLimit.test.ts`
- [ ] T048 [P] [US3] Unit test: order-of-operations percent then fixed in `backend/tests/unit/engine.orderOfOps.test.ts`
- [ ] T049 [P] [US3] Unit test: negative total protection clamps to zero in `backend/tests/unit/engine.nonNegative.test.ts`

### Implementation for User Story 3

- [ ] T050 [P] [US3] Create coupon redemption repo (usage history) in `backend/src/models/couponRedemptionRepo.ts`
- [ ] T051 [US3] Enforce per-user usage limit check in `backend/src/services/promotions/couponValidation.ts` (depends on T050)
- [ ] T052 [US3] Ensure engine clamps totals to zero and exposes deterministic discount line ordering in `backend/src/services/promotions/engine.ts`
- [ ] T053 [P] [US3] Add backend message mapping for usage limit reached ("คุณใช้สิทธิ์ครบแล้ว") in `backend/src/services/promotions/messages.ts`
- [ ] T054 [P] [US3] Add frontend UI message handling for usage-limit error in `frontend/src/components/CouponInput.tsx`
- [ ] T055 [P] [US3] Frontend component test for usage-limit message in `frontend/tests/CouponInput.usageLimit.test.tsx`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T056 [P] Add API and error response documentation alignment in `specs/001-promotions-discounts/contracts/http-api.md`
- [ ] T057 Add structured logging for promotion application outcomes in `backend/src/services/promotions/logger.ts`
- [ ] T058 Add performance smoke test for totals calculation in `backend/tests/perf/engine.smoke.test.ts`
- [ ] T059 [P] Add accessibility checks for coupon input (labels/aria) in `frontend/src/components/CouponInput.tsx`
- [ ] T060 Run quickstart scenario validation and update notes in `specs/001-promotions-discounts/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3–5)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on completing the desired user stories

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; delivers MVP coupon apply + expiry/min spend validation
- **US2 (P2)**: Can start after Foundational; can run in parallel with US1 if staffed
- **US3 (P3)**: Can start after Foundational; may require US1 coupon plumbing but is testable via engine + API

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Data access modules before service logic
- Service logic before API routes
- API before frontend wiring
- Core behavior before polish

---

## Parallel Opportunities (Concrete)

### Phase 1

- [P] tasks: T002–T007 can run in parallel.

### Phase 2

- [P] tasks: T010–T012, T013–T015, T016–T019, T020–T023 can be split across developers.

### After Phase 2

- US1 (T024–T037), US2 (T038–T046), and US3 (T047–T055) can proceed in parallel with coordination on shared files:
  - Shared backend engine file: `backend/src/services/promotions/engine.ts`
  - Shared frontend checkout page: `frontend/src/pages/CheckoutPage.tsx`

