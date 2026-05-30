# Promotions & Discounts System Test Report

**Date:** May 30, 2026
**Project Version:** PDSD02 (TypeScript — Promotions Engine with REST API)

## 1. Test Summary

All scenarios defined in `scenarios_promotions.md` have been tested using Jest.

### Scenario Tests

| Scenario | Test File | Result | Notes |
|---|---|---|---|
| **1) Coupon Validation** | `integration/applyCoupon.success.test.ts` | ❌ FAIL | grandTotalSatang mismatch: expected 90000, got 80000 — demo-cart has active 10% promotion, engine applies it before coupon (800 THB result instead of 900 THB) |
| **2) Cart Total Discount %** | `integration/getTotals.percentPromo.test.ts` | ✅ PASS | 2,000 THB × 10% = 200 THB; grandTotal = 1,800 THB |
| **3) Expiration Date Check** | `integration/applyCoupon.expired.test.ts` | ✅ PASS | EXPIRED coupon rejected (HTTP 409, code=COUPON_EXPIRED, message="คูปองหมดอายุ") |
| **Edge 1) Coupon Usage Limit** | `integration/applyCoupon.usageLimit.test.ts` | ✅ PASS | WELCOME coupon blocked on 2nd use (HTTP 409, code=COUPON_USAGE_LIMIT_REACHED, message="คุณใช้สิทธิ์ครบแล้ว") |
| **Edge 2) Order of Operations** | `unit/engine.orderOfOps.test.ts` | ✅ PASS | 1,000 THB with 10% promo + SAVE100 → (1000 − 100 − 100) = 800 THB |
| **Edge 3) Negative Total Protection** | `unit/engine.nonNegative.test.ts` | ✅ PASS | 50 THB cart with 100 THB coupon → grandTotal clamped to 0 THB |

### Contract Tests

| Test | Result | Notes |
|---|---|---|
| `contract/applyCoupon.contract.test.ts` | ✅ PASS | POST /checkout/apply-coupon returns `totals`, `discountLines`, `message` with correct types |
| `contract/getTotals.contract.test.ts` | ✅ PASS | GET /checkout/totals returns `totals` and `discountLines` array |

### Performance Test

| Test | Result | Notes |
|---|---|---|
| `perf/engine.smoke.test.ts` | ✅ PASS | 5,000 iterations of `computeTotals` complete in < 2,000 ms |

**Total: 8 passed, 1 failed, 9 total**

---

## 2. Test Output

```text
$ npm test

> jest

PASS tests/unit/engine.nonNegative.test.ts
PASS tests/unit/engine.orderOfOps.test.ts
PASS tests/perf/engine.smoke.test.ts
FAIL tests/integration/applyCoupon.success.test.ts
  ● Apply coupon - success path (SAVE100) › applies 100 THB discount when min spend met

    Expected: 90000
    Received: 80000

      14 |       expect(body.totals.grandTotalSatang).toBe(90000);

PASS tests/integration/getTotals.percentPromo.test.ts
PASS tests/integration/applyCoupon.usageLimit.test.ts
PASS tests/integration/applyCoupon.expired.test.ts
PASS tests/contract/applyCoupon.contract.test.ts
PASS tests/contract/getTotals.contract.test.ts

Test Suites: 1 failed, 8 passed, 9 total
Tests:       1 failed, 8 passed, 9 total
Time:        2.04 s
```

---

## 3. Failure Analysis

**`integration/applyCoupon.success.test.ts` (Scenario 1 — Coupon Validation)**

Root cause: `withTestServer` fixtures ใช้ `demo-cart` ที่มีโปรโมชั่น 10% active อยู่แล้ว engine จึงคำนวณตามลำดับที่ถูกต้อง (promotion ก่อน, coupon ที่สอง):

```
subtotal         = 100,000 satang (1,000 THB)
− 10% promo      =  10,000 satang
− SAVE100 coupon =  10,000 satang
= grandTotal     =  80,000 satang (800 THB)
```

Test expects 90,000 satang (สมมติว่าไม่มีโปรโมชั่น) แต่ engine ทำงานถูกต้องตาม Edge 2 (Order of Operations) — ปัญหาอยู่ที่ test fixture ออกแบบโดยไม่คำนึงถึงโปรโมชั่นที่ active ใน demo-cart

---

## 4. Code Implementation Details

### Promotion Engine (`src/services/promotions/engine.ts`)

```typescript
export function computeTotals({ cart, promotions = [], coupon }: ComputeInput): ComputeOutput {
  let running = cart.subtotalSatang;
  const discountLines: DiscountLine[] = [];

  // 1. Apply percentage promotions first
  for (const promo of promotions.filter(p => p.isActive)) {
    const discountSatang = Math.round((running * promo.percentBasisPoints) / 10000);
    running -= discountSatang;
    discountLines.push({ type: 'promotion', sourceId: promo.id, amountSatang: discountSatang });
  }

  // 2. Apply fixed coupon second
  if (coupon && coupon.isActive && running >= coupon.minSpendSatang) {
    const discountSatang = Math.min(coupon.amountSatang, running);
    running -= discountSatang;
    discountLines.push({ type: 'coupon', sourceId: coupon.id, amountSatang: discountSatang });
  }

  return {
    totals: {
      currency: cart.currency,
      subtotalSatang: cart.subtotalSatang,
      discountTotalSatang: cart.subtotalSatang - Math.max(0, running),
      grandTotalSatang: Math.max(0, running),   // negative protection
    },
    discountLines,
  };
}
```

### Coupon Validation (`src/services/promotions/couponValidation.ts`)

ตรวจสอบ 3 เงื่อนไขตามลำดับ: expiration → minimum spend → usage limit

### Logger (`src/services/promotions/logger.ts`)

บันทึก outcome ทุกครั้งที่คูปองถูก apply หรือ reject (APPLIED / REJECTED + reasonCode)
