# Promotions and Discounts System Test Report (v.11)

**Date:** January 23, 2026
**Project Version:** promotions-app (v.11)

## 1. Test Summary

All scenarios defined in `scenarios_promotions.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Coupon Validation** | ✅ PASS | Min purchase condition met, fixed amount discount applied correctly. |
| **2) Cart Total Discount %** | ✅ PASS | 10% auto-discount applied correctly to subtotal. |
| **3) Expiration Date Check** | ✅ PASS | Expired coupon rejected, correct error returned. |
| **Edge 1) Coupon Usage Limit** | ✅ PASS | One-time use coupon rejected on second attempt (after simulating cleared cart). |
| **Edge 2) Order of Operations** | ✅ PASS | Verified: (Subtotal - 10%) - Coupon = Total. |
| **Edge 3) Negative Total Protection** | ✅ PASS | Total capped at 0 when discount > subtotal. |

---

## 2. Test Output

```text
 PASS  tests/scenarios.test.js
  Promotions and Discounts Scenarios (v.11)
    ✓ 1) Coupon Validation: Min purchase 500, Save 100 (59 ms)
    ✓ 2) Cart Total Discount %: 10% off (14 ms)
    ✓ 3) Expiration Date Check (10 ms)
    ✓ Edge 1) Coupon Usage Limit (16 ms)
    ✓ Edge 2) Order of Operations: 10% then 100 baht (11 ms)
    ✓ Edge 3) Negative Total Protection (8 ms)

 PASS  tests/promotionService.test.js
  promotion service helpers
    ✓ determinePriority favors percent discounts (2 ms)
    ✓ computeDiscountAmount covers percent and fixed values (1 ms)

 PASS  tests/money.test.js
  money helpers
    ✓ percentOf calculates integer cents deterministically (1 ms)
    ✓ clampZero prevents negative totals (1 ms)
    ✓ sumCents aggregates arrays safely (0 ms)

Test Suites: 3 passed, 3 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        0.703 s, estimated 1 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Pricing and Validation Logic (`promotionService.js`)

The core logic handles validation (expiration, minimum spend, usage limits) and calculation (percent vs fixed), ensuring data integrity via database constraints.

```javascript
async function applyCoupon({ userId, couponCode }) {
    // ... validation ...
    validateDateWindow(coupon);
    validateMinimum(cart, coupon);
    await validateUsage(userId, coupon);

    // ... calculation ...
    const discountAmount = computeDiscountAmount(cart, coupon);
    
    // ... applying discount ...
    await cartRepository.addDiscountLine(cart.id, {
      couponCode: normalizedCode,
      amountCents: discountAmount,
      priority,
      discountType: coupon.type,
      reason: 'applied',
    });
    
    // ... logging usage ...
    await usageRepository.incrementUsage(userId, normalizedCode);
}
```

### Backend: Test Scenarios (`tests/scenarios.test.js`)

The Jest test file verifies the business rules by simulating database states directly.

```javascript
    // Edge Case 1: Coupon Usage Limit
    test("Edge 1) Coupon Usage Limit", async () => {
        // Context: WELCOME 1 use/person.
        const userId = "user1";
        await query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 50000]);

        // 1) First use
        await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "WELCOME" })
            .expect(200);
        
        // Remove from cart to pass "duplicate check" and hit "usage limit check"
        await query("DELETE FROM cart_discounts WHERE coupon_code = $1", ["WELCOME"]);

        // 2) Try to use again
        const res = await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "WELCOME" })
            .expect(400); // Expect failure
        
        expect(JSON.stringify(res.body)).toMatch(/limit|ครบ|เต็ม/i);
    });
```
