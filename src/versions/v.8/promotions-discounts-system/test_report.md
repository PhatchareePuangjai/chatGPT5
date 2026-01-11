# Promotions and Discounts System Test Report

**Date:** January 11, 2026
**Project Version:** promotions-discounts-system (v.8)

## 1. Test Summary

All scenarios defined in `scenarios_promotions.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Coupon Validation** | ✅ PASS | Min purchase condition met, fixed amount discount applied correctly. |
| **2) Cart Total Discount %** | ✅ PASS | 10% discount applied correctly to original total. |
| **3) Expiration Date Check** | ✅ PASS | Expired coupon rejected with specific error. |
| **Edge 1) Coupon Usage Limit** | ✅ PASS | One-time use coupon rejected on second attempt by same user. |
| **Edge 2) Order of Operations** | ✅ PASS | Verified: (Original - 10%) - Fixed = Grand Total. |
| **Edge 3) Negative Total Protection** | ✅ PASS | Grand Total capped at 0 when fixed discount > remaining total. |

---

## 2. Test Output

```text
 PASS  tests/scenarios.test.js
  Promotions and Discounts System (v.8) - Scenarios
    ✓ 1) Coupon Validation: Min purchase 500, Save 100 (118 ms)
    ✓ 2) Cart Total Discount %: 10% off (25 ms)
    ✓ 3) Expiration Date Check (22 ms)
    ✓ Edge 1) Coupon Usage Limit: 1 time per user (37 ms)
    ✓ Edge 2) Order of Operations: 10% then 100 baht (24 ms)
    ✓ Edge 3) Negative Total Protection (24 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.696 s
Ran all test suites matching tests/scenarios.test.js.
```

---

## 3. Code Implementation Details

### Backend: Coupon Application Logic (`applyCouponController.js`)

This function handles the core business logic for applying coupons, ensuring the correct order of operations, validation, and preventing negative totals.

```javascript
// Sequenced calculation (integer satang)
const percentBps = parseInt(coupon.percent_bps, 10);
const fixedSatang = parseInt(coupon.fixed_discount_satang, 10);

const percentDiscount = calcPercentDiscount(original, percentBps);
const afterPercent = original - percentDiscount;
const afterFixed = afterPercent - fixedSatang;

// Negative protection (grand total must never be negative)
const grandTotal = Math.max(0, afterFixed);

// Adjust actual fixed discount applied if coupon exceeds remaining total
const fixedApplied = Math.max(0, Math.min(fixedSatang, afterPercent));
```

### Backend: Coupon Validation (`applyCouponController.js`)

Validation logic ensures coupons are active, meet minimum requirements, and haven't exceeded usage limits.

```javascript
// 3) Expiry check
if (coupon.expires_at) {
  const now = new Date();
  const expires = new Date(coupon.expires_at);
  if (now.getTime() > expires.getTime()) {
    return res.status(400).json({ error: "COUPON_EXPIRED", message: "Coupon has expired" });
  }
}

// 4) Minimum purchase check
const minPurchase = parseInt(coupon.min_purchase_satang, 10);
if (original < minPurchase) {
  return res.status(400).json({ /* ... */ });
}

// 5) One-time per user policy
if (coupon.one_time_per_user) {
  const used = await db.query(
    `SELECT 1 FROM user_coupon_history WHERE user_id = $1 AND coupon_id = $2 LIMIT 1`,
    [userId, coupon.id]
  );
  if (used.rowCount > 0) {
    return res.status(400).json({ error: "COUPON_OVERUSED", message: "Coupon already used by this user" });
  }
}
```

## 4. Test Script (`backend/tests/scenarios.test.js`)

The Jest test file verifies the scenarios by interacting with the API endpoints (`POST /api/orders` and `POST /api/apply-coupon`) and checking the database state via response bodies.

```javascript
  // Edge Case 2: Order of Operations
  test("Edge 2) Order of Operations: 10% then 100 baht", async () => {
    // Context: Item 1000 (100000 satang). Coupon "COMBO" (10% + 100).
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "COMBO" })
      .expect(200);

    // Logic: (1000 - 10%) - 100 = 900 - 100 = 800
    // Satang: (100000 - 10000) - 10000 = 80000
    expect(res.body.discount_percent_satang).toBe(10000);
    expect(res.body.discount_fixed_satang).toBe(10000);
    expect(res.body.grand_total_satang).toBe(80000);
  });
```
