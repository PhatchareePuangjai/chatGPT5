# Promotions & Discounts System Test Report

**Date:** May 31, 2026
**Project Version:** PDSD01 (TypeScript - Promotions & Discounts Backend)

## 1. Test Summary

Scenarios defined in `scenarios_promotions.md` were tested using Vitest.

### Scenario Tests

| Scenario | Test File | Result | Notes |
|---|---|---|---|
| Coupon Validation | `tests/integration/applyCouponSave100.test.ts` | PASS | 1,000 THB cart with SAVE100 coupon (no active promotion) → 900 THB grand total |
| Cart Total Discount % | `tests/integration/cartPercentPromo.test.ts` | PASS | 2,000 THB cart receives 10% promotion |
| Expiration Date Check | `tests/integration/applyCouponExpired.test.ts` | PASS | EXPIRED coupon correctly rejected |
| Coupon Usage Limit | `tests/integration/couponUsageLimit.test.ts` | PASS | WELCOME coupon is blocked after first use for same user |
| Order of Operations | `tests/unit/discountOrder.test.ts` | PASS | Percent discounts are applied before fixed discounts |
| Negative Total Protection | `tests/unit/nonNegativeTotals.test.ts` | PASS | Grand total is clamped to 0 |

**Total: 6 passed, 0 failed, 6 total**

> **Note — Additional tests (not counted in scenario total):**
> The following tests verify eligibility rules, calculation correctness, error handling, and performance at a finer granularity; they do not correspond to a scenario in `scenarios_promotions.md`.
>
> | Test File | Result | Notes |
> |---|---|---|
> | `tests/unit/couponEligibility.test.ts` | PASS | Unit-level eligibility: valid coupon accepted + expired coupon rejected (2 cases) |
> | `tests/unit/promotionPercent.test.ts` | PASS | Percentage promotion calculation unit test |
> | `tests/integration/couponInvalid.test.ts` | PASS | Unknown coupon rejection |
> | `tests/integration/pricingPerfSanity.test.ts` | PASS | Performance smoke test |

---

## 2. Test Output

```text
$ DATABASE_URL=postgres://postgres:postgres@localhost:5432/pdsd01 STORE_TIMEZONE=Asia/Bangkok npm test

Test Files  10 passed (10)
Tests       11 passed (11)
```

---

## 3. Fix Notes (2026-06-01)

Two test infrastructure issues were resolved:

### `tests/integration/applyCouponSave100.test.ts`

Removed `seedPromotions()` from `beforeEach` — the test scenario tests coupon-only pricing; seeding an active 10% promotion caused the engine to apply both discounts, producing 800 THB instead of the expected 900 THB.

### `.js` duplicate test files removed

All `.js` duplicates of `.ts` test files were removed. Having both `.ts` and `.js` versions of each test caused vitest to run them as parallel workers against the same PostgreSQL database, creating race conditions where one worker's `resetDb()` truncated tables while another worker's test was executing.

---

## 4. Code Implementation Details

- Test runner: Vitest
- Backend path: `src/versions/PDSD01/backend`
- Database: PostgreSQL via `DATABASE_URL`
- Relevant services:
  - `src/services/coupons/applyCoupon.ts`
  - `src/services/coupons/validateCoupon.ts`
  - `src/services/coupons/couponEligibility.ts`
  - `src/services/pricing/pricingEngine.ts`
