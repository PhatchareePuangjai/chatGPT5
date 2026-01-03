# Promotions and Discounts System Test Report

**Date:** January 3, 2026
**Project Version:** promo-shop-plug-and-play (v.5)

## 1. Test Summary

All scenarios defined in `scenarios_promotions.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Coupon Validation** | ✅ PASS | Min purchase condition met, fixed amount discount applied correctly. |
| **2) Cart Total Discount %** | ✅ PASS | 10% auto-discount applied correctly to subtotal. |
| **3) Expiration Date Check** | ✅ PASS | Expired coupon rejected, no discount applied. |
| **Edge 1) Coupon Usage Limit** | ✅ PASS | One-time use coupon rejected on second attempt. |
| **Edge 2) Order of Operations** | ✅ PASS | Verified: (Subtotal - 10%) - Coupon = Total. |
| **Edge 3) Negative Total Protection** | ✅ PASS | Total capped at 0 when discount > subtotal. |

---

## 2. Test Output

```text
 PASS  tests/scenarios.test.js
  Promotions and Discounts Scenarios
    ✓ 1) Coupon Validation: Min purchase 500, Save 100 (69 ms)
    ✓ 2) Cart Total Discount %: 10% off (10 ms)
    ✓ 3) Expiration Date Check (11 ms)
    ✓ Edge 1) Coupon Usage Limit (16 ms)
    ✓ Edge 2) Order of Operations: 10% then 100 baht (10 ms)
    ✓ Edge 3) Negative Total Protection (9 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.531 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Pricing Logic (`pricing.js`)

This function handles the core business logic for calculating totals, ensuring the correct order of operations (Auto Discount -> Coupon) and preventing negative totals.

```javascript
function computeTotals(subtotal_satang, coupon, autoDiscountPercent = 10) {
  // 1. Automatic Discount %
  const auto_discount_satang = Math.round(subtotal_satang * autoDiscountPercent / 100);
  const subtotal_after_auto_satang = Math.max(0, subtotal_satang - auto_discount_satang);

  // 2. Coupon Discount (Fixed Amount)
  let coupon_discount_satang = 0;
  if (coupon) {
    // Cap coupon discount at the remaining subtotal to avoid negative values
    coupon_discount_satang = Math.min(coupon.amount_satang, subtotal_after_auto_satang);
  }

  // 3. Final Total
  const total_satang = Math.max(0, subtotal_after_auto_satang - coupon_discount_satang);

  return {
    subtotal_satang,
    auto_discount_satang,
    subtotal_after_auto_satang,
    coupon_discount_satang,
    total_satang
  };
}
```

### Backend: Coupon Validation (`server.js` & `pricing.js`)

Validation logic ensures coupons are active, meet minimum requirements, and haven't exceeded usage limits.

```javascript
// server.js
const { coupon, errors: couponErrors, messages: couponMessages } = validateCoupon({
  code,
  subtotal_satang: subtotal,
  userUsedCount: usedCount
});

// pricing.js
function validateCoupon({ code, subtotal_satang, userUsedCount }) {
  if (!code) return { coupon: null, errors: [], messages: [] };

  const coupon = COUPONS[code];
  if (!coupon) return { coupon: null, errors: ["Invalid coupon code."], messages: [] };

  if (isExpired(coupon)) return { coupon: null, errors: ["Coupon expired."], messages: [] };

  if (subtotal_satang < (coupon.min_subtotal_satang || 0)) {
    const min = coupon.min_subtotal_satang || 0;
    return { coupon: null, errors: [`Minimum purchase not met. Need at least ${(min/100).toFixed(2)} baht.`], messages: [] };
  }

  if (coupon.per_user_limit && userUsedCount >= coupon.per_user_limit) {
    return { coupon: null, errors: ["You already used this."], messages: [] };
  }

  return { coupon, errors: [], messages: ["Success"] };
}
```

## 4. Test Script (`backend/tests/scenarios.test.js`)

The Jest test file used to verify the scenarios, using `supertest` to hit the API endpoints.

```javascript
  // Edge Case 2: Order of Operations
  test("Edge 2) Order of Operations: 10% then 100 baht", async () => {
    // Context: Item 1000. Discount 10% AND Discount 100 (SAVE100).
    
    const res = await request(app)
      .post("/api/checkout/quote")
      .set("x-auto-discount-percent", "10")
      .send({
        userId: "user1",
        items: [{ productId: "A", qty: 10 }], // 1000
        couponCode: "SAVE100"
      })
      .expect(200);

    // Then:
    // (1000 - 10%) - 100 = 800
    // 1000 - 100 = 900 (after auto)
    // 900 - 100 = 800 (after coupon)
    expect(res.body.pricing.subtotal_satang).toBe(100000);
    expect(res.body.pricing.auto_discount_satang).toBe(10000); // 100 baht
    expect(res.body.pricing.subtotal_after_auto_satang).toBe(90000); // 900 baht
    expect(res.body.pricing.coupon_discount_satang).toBe(10000); // 100 baht
    expect(res.body.pricing.total_satang).toBe(80000); // 800 baht
  });
```
