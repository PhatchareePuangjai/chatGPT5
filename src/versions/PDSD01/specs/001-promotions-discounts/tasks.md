---

description: "Task list for Promotions & Discounts implementation"
---

# Tasks: Promotions & Discounts

**Input**: Design documents from `specs/001-promotions-discounts/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Tests are REQUIRED by the project constitution; add unit + integration + E2E coverage per story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` and `frontend/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create repo structure `backend/`, `frontend/`, and `.editorconfig` per `specs/001-promotions-discounts/plan.md`
- [x] T002 [P] Add backend Node/TS scaffold in `backend/package.json`, `backend/tsconfig.json`, `backend/src/index.ts`
- [x] T003 [P] Add frontend React scaffold in `frontend/package.json`, `frontend/src/main.tsx`, `frontend/index.html`
- [x] T004 [P] Configure formatting/linting for backend in `backend/eslint.config.*` and `backend/.prettierrc*`
- [x] T005 [P] Configure formatting/linting for frontend in `frontend/eslint.config.*` and `frontend/.prettierrc*`
- [x] T006 Add root documentation `README.md` describing how to run backend/frontend locally
- [x] T007 Add shared env example `backend/.env.example` and `frontend/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Set up PostgreSQL connection/config module in `backend/src/db/index.ts`
- [x] T009 Set up migrations framework and first migration in `backend/migrations/001_init.sql` (or equivalent)
- [x] T010 Define money representation + rounding policy in `backend/src/lib/money.ts`
- [x] T011 Implement canonical pricing engine entrypoint in `backend/src/services/pricing/pricingEngine.ts`
- [x] T012 Define discount stacking order constants in `backend/src/services/pricing/discountOrder.ts`
- [x] T013 Implement API error response shape + mapping in `backend/src/api/errors.ts`
- [x] T014 Implement request validation helpers in `backend/src/api/validation.ts`
- [x] T015 Create API router wiring in `backend/src/api/router.ts` and mount in `backend/src/index.ts`
- [x] T016 Add backend test harness setup in `backend/tests/setup.ts`
- [x] T017 Add integration-test Postgres harness (docker-compose or testcontainers) in `backend/tests/integration/dbHarness.ts`
- [x] T018 Add seed helpers for coupons/promotions/history in `backend/tests/fixtures/seed.ts`
- [x] T019 Add frontend API client wrapper in `frontend/src/services/apiClient.ts`
- [x] T020 Add frontend currency/money formatting helper in `frontend/src/lib/moneyFormat.ts`
- [x] T021 Add E2E test harness setup in `frontend/tests/e2e/` (tooling config + first smoke test)

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Apply Coupon Code (Priority: P1) 🎯 MVP

**Goal**: Validate and apply coupon codes with correct totals and user messages.

**Independent Test**: Execute US1 acceptance scenarios from `specs/001-promotions-discounts/spec.md` via API and UI:
apply `SAVE100` succeeds; apply `EXPIRED` rejects with totals unchanged.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US1] Unit tests for coupon eligibility (min spend, expiration) in `backend/tests/unit/couponEligibility.test.ts`
- [x] T023 [P] [US1] Integration test for applying `SAVE100` in `backend/tests/integration/applyCouponSave100.test.ts`
- [x] T024 [P] [US1] Integration test for rejecting `EXPIRED` with unchanged totals in `backend/tests/integration/applyCouponExpired.test.ts`
- [x] T025 [P] [US1] E2E test: apply valid coupon shows success message in `frontend/tests/e2e/applyCouponValid.spec.ts`
- [x] T026 [P] [US1] E2E test: apply expired coupon shows error message in `frontend/tests/e2e/applyCouponExpired.spec.ts`

### Implementation for User Story 1

- [x] T027 [P] [US1] Create coupon persistence schema + indexes in `backend/migrations/002_coupons.sql`
- [x] T028 [P] [US1] Create redemption history schema in `backend/migrations/003_coupon_redemptions.sql`
- [x] T029 [P] [US1] Implement coupon repository in `backend/src/models/coupons/couponRepo.ts`
- [x] T030 [P] [US1] Implement redemption history repository in `backend/src/models/coupons/redemptionRepo.ts`
- [x] T031 [US1] Implement coupon validation service (min spend, expiration) in `backend/src/services/coupons/validateCoupon.ts`
- [x] T032 [US1] Implement apply-coupon service (returns pricing breakdown) in `backend/src/services/coupons/applyCoupon.ts`
- [x] T033 [US1] Implement POST coupon endpoint per `contracts/http-api.md` in `backend/src/api/routes/coupons.post.ts`
- [x] T034 [US1] Implement DELETE coupon endpoint in `backend/src/api/routes/coupons.delete.ts`
- [x] T035 [P] [US1] Build coupon input UI component in `frontend/src/components/CouponCodeForm.tsx`
- [x] T036 [P] [US1] Build pricing summary UI component in `frontend/src/components/PricingSummary.tsx`
- [x] T037 [US1] Wire checkout page flow (apply/remove coupon) in `frontend/src/pages/CheckoutPage.tsx`
- [x] T038 [US1] Ensure user-facing Thai messages match spec in `frontend/src/i18n/messages.ts` (or equivalent)

**Checkpoint**: User Story 1 works independently end-to-end (API + UI) and all US1 tests pass.

---

## Phase 4: User Story 2 - Automatic Cart Total Percentage Discount (Priority: P2)

**Goal**: Apply an automatic 10% cart-total promotion and show a separate discount line and correct grand total.

**Independent Test**: For a 2,000 THB cart, verify discount line = 200 THB and grand total = 1,800 THB.

### Tests for User Story 2 ⚠️

- [x] T039 [P] [US2] Unit tests for percentage promotion calculation in `backend/tests/unit/promotionPercent.test.ts`
- [x] T040 [P] [US2] Integration test: 2,000 THB cart gets 10% discount line in `backend/tests/integration/cartPercentPromo.test.ts`
- [x] T041 [P] [US2] E2E test: checkout shows separate promotion line item in `frontend/tests/e2e/promoLineItem.spec.ts`

### Implementation for User Story 2

- [x] T042 [P] [US2] Add promotions schema in `backend/migrations/004_promotions.sql`
- [x] T043 [P] [US2] Implement promotion repository in `backend/src/models/promotions/promotionRepo.ts`
- [x] T044 [US2] Implement automatic promotion selection in `backend/src/services/promotions/selectPromotions.ts`
- [x] T045 [US2] Integrate promotions into pricing engine in `backend/src/services/pricing/pricingEngine.ts`
- [x] T046 [US2] Implement GET pricing endpoint per contract in `backend/src/api/routes/pricing.get.ts`
- [x] T047 [US2] Update pricing summary UI to render ordered discount lines in `frontend/src/components/PricingSummary.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently, and promotion discount is transparent and correct.

---

## Phase 5: User Story 3 - Promotion Guardrails (Limits, Ordering, and Non-Negative Totals) (Priority: P3)

**Goal**: Enforce per-user coupon usage limits, stacking order correctness, and non-negative totals.

**Independent Test**: Validate WELCOME usage limit, 10% then 100 THB order-of-ops result 800, and negative-total protection.

### Tests for User Story 3 ⚠️

- [x] T048 [P] [US3] Integration test: WELCOME second use rejected with message in `backend/tests/integration/couponUsageLimit.test.ts`
- [x] T049 [P] [US3] Unit tests: stacking order produces 800 not 810 in `backend/tests/unit/discountOrder.test.ts`
- [x] T050 [P] [US3] Unit tests: non-negative totals clamp to 0 in `backend/tests/unit/nonNegativeTotals.test.ts`
- [x] T051 [P] [US3] E2E test: usage limit message displayed in `frontend/tests/e2e/couponUsageLimit.spec.ts`

### Implementation for User Story 3

- [x] T052 [US3] Enforce per-user coupon usage limit in `backend/src/services/coupons/validateCoupon.ts`
- [x] T053 [US3] Implement/lock stacking order in `backend/src/services/pricing/discountOrder.ts`
- [x] T054 [US3] Implement non-negative grand total protection in `backend/src/services/pricing/pricingEngine.ts`
- [x] T055 [US3] Add audit-friendly discount breakdown output in `backend/src/services/pricing/pricingEngine.ts`
- [x] T056 [US3] Ensure API rejection codes/messages match contract in `backend/src/api/routes/coupons.post.ts`

**Checkpoint**: All user stories are independently functional, edge-case guarded, and fully tested.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T057 Documentation update: ensure `specs/001-promotions-discounts/quickstart.md` matches implementation behavior
- [x] T058 Add accessibility review for checkout components in `frontend/src/pages/CheckoutPage.tsx`
- [x] T059 Add performance sanity checks (pricing recomputation) in `backend/tests/integration/pricingPerfSanity.test.ts`
- [x] T060 Add monitoring/logging fields for pricing decisions (no sensitive data) in `backend/src/api/middleware/logging.ts`
- [x] T061 Add negative tests for invalid/unknown coupon codes in `backend/tests/integration/couponInvalid.test.ts`
- [x] T062 Run `specs/001-promotions-discounts/quickstart.md` validation checklist and update if gaps found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Stories can proceed sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on other stories
- **US2 (P2)**: Starts after Foundational; uses shared pricing engine established in Phase 2
- **US3 (P3)**: Starts after US1/US2 core flows are in place; hardens behavior and edge cases

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Persistence (migrations) before repositories
- Repositories before services
- Services before API routes
- API routes before UI wiring and E2E stabilization

### Parallel Opportunities

- Setup tooling tasks marked [P] can run in parallel
- Many test tasks are [P] and can be written in parallel
- Frontend component work can proceed in parallel with backend endpoints once contracts are stable

---

## Parallel Example: User Story 1

```bash
# Write the failing tests in parallel:
Task: "T022 Unit tests for coupon eligibility in backend/tests/unit/couponEligibility.test.ts"
Task: "T023 Integration test for applying SAVE100 in backend/tests/integration/applyCouponSave100.test.ts"
Task: "T024 Integration test for rejecting EXPIRED in backend/tests/integration/applyCouponExpired.test.ts"

# Build UI components in parallel (once endpoints exist or are mocked):
Task: "T035 Build CouponCodeForm in frontend/src/components/CouponCodeForm.tsx"
Task: "T036 Build PricingSummary in frontend/src/components/PricingSummary.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (pricing engine + test harness)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run US1 tests + manual quickstart checks

### Incremental Delivery

1. Ship US1 (coupon validation + messages) → validate
2. Add US2 (automatic percentage promo) → validate
3. Add US3 (guardrails) → validate
4. Polish and harden
