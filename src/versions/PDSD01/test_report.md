# Promotions & Discounts System Test Report

**Date:** May 31, 2026
**Project Version:** PDSD01 (TypeScript - Promotions & Discounts Backend)

## 1. Test Summary

Scenarios defined in `scenarios_promotions.md` were tested using Vitest.

### Scenario Tests

| Scenario | Test File | Result | Notes |
|---|---|---|---|
| Coupon Validation | `tests/integration/applyCouponSave100.test.ts` | FAIL | Expected 900 THB grand total, received 800 THB because active 10% cart promotion is applied before SAVE100 coupon |
| Cart Total Discount % | `tests/integration/cartPercentPromo.test.ts` | PASS | 2,000 THB cart receives 10% promotion |
| Expiration Date Check | `tests/integration/applyCouponExpired.test.ts` | FAIL | EXPIRED coupon was applied instead of rejected |
| Coupon Usage Limit | `tests/integration/couponUsageLimit.test.ts` | PASS | WELCOME coupon is blocked after first use for same user |
| Order of Operations | `tests/unit/discountOrder.test.ts` | PASS | Percent discounts are applied before fixed discounts |
| Negative Total Protection | `tests/unit/nonNegativeTotals.test.ts` | PASS | Grand total is clamped to 0 |

### Additional Tests

| Test File | Result | Notes |
|---|---|---|
| `tests/unit/couponEligibility.test.ts` | PASS | Eligibility accepts valid coupon and rejects expired coupon at unit level |
| `tests/unit/promotionPercent.test.ts` | PASS | Calculates 10% promotion correctly |
| `tests/integration/couponInvalid.test.ts` | PASS | Unknown coupon is rejected |
| `tests/integration/pricingPerfSanity.test.ts` | PASS | Pricing calculation completes quickly in-process |

**Total: 9 passed, 2 failed, 11 total**

---

## 2. Test Output

```text
$ DATABASE_URL=postgres://postgres:postgres@localhost:5432/pdsd01 STORE_TIMEZONE=Asia/Bangkok npm test

Test Files  2 failed | 8 passed (10)
Tests       2 failed | 9 passed (11)

FAIL tests/integration/applyCouponExpired.test.ts
AssertionError: promise resolved "{ status: 'applied', ... }" instead of rejecting

FAIL tests/integration/applyCouponSave100.test.ts
AssertionError: expected 80000 to be 90000
```

---

## 3. Failure Analysis

### `tests/integration/applyCouponSave100.test.ts`

The test expects a 1,000 THB cart with SAVE100 coupon to produce a 900 THB grand total.

Actual result is 800 THB because seeded promotions include an active 10% cart promotion. The pricing engine applies percentage discounts before fixed coupon discounts:

```text
1,000 THB subtotal
- 100 THB active cart promotion
- 100 THB SAVE100 coupon
= 800 THB grand total
```

### `tests/integration/applyCouponExpired.test.ts`

The test expects coupon `EXPIRED` to be rejected, but `applyCouponToCart` returned `status: "applied"`.

The unit-level eligibility test passes for expired coupon logic, so the integration failure likely comes from persisted database state or seed behavior around `on conflict (code) do nothing`, where an existing coupon row may prevent the expired fixture from replacing prior data.

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
