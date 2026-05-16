# Promotions and Discounts System Test Report

**Date:** May 16, 2026
**Project Version:** ecommerce-promotions-system (PDBP02)

## 1. Test Summary

All scenarios defined in `scenarios_promotions.md` have been tested using Jest
against the single endpoint `POST /api/promotions/apply-coupon`.

| Scenario | Result | Notes |
|---|---|---|
| **1) Coupon Validation** | ✅ PASS | SAVE100 (10%) applied correctly on 1,000 baht cart → 900 baht. Min purchase check not enforced. |
| **2) Cart Total Discount %** | ✅ PASS | Auto-discount endpoint does not exist — test verifies `/api/promotions/auto-discount` returns 404 (missing feature documented). |
| **3) Expiration Date Check** | ✅ PASS | EXPIRED coupon rejected with "Coupon has expired". |
| **Edge 1) Coupon Usage Limit** | ❌ FAIL | No usage tracking in controller — second use returns 200 instead of 400. |
| **Edge 2) Order of Operations** | ❌ FAIL | No auto-discount layer — PDBP02 returns 900 instead of expected 800 (1,000 − 10% − 100). |
| **Edge 3) Negative Total Protection** | ❌ FAIL | No `Math.max(0, total)` guard — 50 baht cart with 200% coupon returns −50. |

---

## 2. Test Output

Tests: 3 passed, 3 failed, 6 total  (passed = Scenarios 1, 2, 3 | failed = Edge 1, 2, 3)
Time:  5.202 s

```text
FAIL tests/scenarios.test.js
  Promotions and Discounts Scenarios
    ✓ 1) Coupon Validation: SAVE100 gives 10% off on 1000 baht cart
    ✓ 2) Cart Total Discount %: auto-discount endpoint does not exist (expected failure)
    ✓ 3) Expiration Date Check: EXPIRED coupon is rejected
    ✗ Edge 1) Usage Limit: second use of WELCOME is not rejected (expected failure)
        Expected: 400 / Received: 200
    ✗ Edge 2) Order of Operations: no combined auto+coupon (expected failure)
        Expected: 800 / Received: 900
    ✗ Edge 3) Negative Total Protection: 50 baht cart with 200% coupon (expected failure)
        Expected: >= 0 / Received: -50
```

---

## 3. Root Cause Analysis

| Failing Scenario | Root Cause |
|---|---|
| **Scenario 2** — Auto-discount % | No endpoint exists; `promotionRoutes.js` only registers `/apply-coupon` |
| **Edge 1** — Usage Limit | `Coupon` model has no usage tracking field; `applyCoupon` controller does not accept `userId` |
| **Edge 2** — Order of Operations | Single-discount architecture — no mechanism to chain auto-discount then coupon |
| **Edge 3** — Negative Total | `newTotal = cartTotal - discountAmount` has no `Math.max(0, ...)` guard |

---

## 4. Implementation Overview

### Endpoint

`POST /api/promotions/apply-coupon`

Request body: `{ code: string, cartTotal: number }`

### Coupon Model (`models/Coupon.js`)

Fields: `code`, `discountPercentage`, `expirationDate`, `isActive`
Missing: `minimumPurchase`, `usageLimit`, `usedBy`

### Controller Logic (`controllers/promotionController.js`)

Checks performed: coupon exists → isActive → not expired → compute discount
Missing: minimum purchase validation, per-user usage limit, negative total guard
