# Promotions and Discounts System Test Report (PDAG01)

**Date:** March 1, 2026
**Project Version:** promotions PDAG01 (AI-generated)

## 1. Test Summary

All scenarios defined in `scenarios_promotions.md` have been tested using Jest (integration tests against the running Docker stack).

| Scenario | Result | Notes |
|---|---|---|
| **1) Coupon Validation** | ✅ PASS | `SAVE100` applied to 1,000 บาท cart; min-purchase check passed; final total = 900 บาท. |
| **2) Cart Total Discount %** | ✅ PASS | `10PERCENT` on 2,000 บาท → discount 200; grand total = 1,800 บาท. |
| **3) Expiration Date Check** | ✅ PASS | `EXPIRED` coupon rejected with HTTP 400 and message "คูปองหมดอายุ". |
| **Edge 1) Coupon Usage Limit** | ✅ PASS | Fresh user accepted; `user123` (pre-exhausted limit) rejected with "คุณใช้สิทธิ์ครบแล้ว". |
| **Edge 2) Order of Operations** | ✅ PASS | 10% applied first, then fixed −100: (1,000 − 10%) − 100 = 800 บาท. |
| **Edge 3) Negative Total Protection** | ✅ PASS | 50 บาท cart with 50 บาท coupon → final total = 0 (not −50). |

---

## 2. Test Output

```text
 PASS  ./scenarios.test.js
  Promotions and Discounts Scenarios (PDAG01)
    ✓ Scenario 1: Coupon Validation — Min purchase 500 บาท, Save 100 บาท (6 ms)
    ✓ Scenario 2: Cart Total Discount % — ลด 10% ท้ายบิล (4 ms)
    ✓ Scenario 3: Expiration Date Check — คูปองหมดอายุ (3 ms)
    ✓ Edge Case 1: Coupon Usage Limit — WELCOME ใช้ได้ 1 ครั้ง/คน (5 ms)
    ✓ Edge Case 2: Order of Operations — (1,000 - 10%) - 100 = 800 บาท (2 ms)
    ✓ Edge Case 3: Negative Total Protection — ยอดสุทธิต้องไม่ติดลบ (2 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.334 s
Ran all test suites.
```

---

## 3. Code Implementation Details

| Item | Value |
|---|---|
| **Language / Framework** | Python 3.x + FastAPI + Pydantic |
| **Database** | None — in-memory mock data (`COUPONS_DB`, `USER_COUPON_USAGE` dicts) |
| **Backend port** | `8000` |
| **Coupon sort strategy** | Percentage coupons applied before fixed (sort by type before calculation) |
| **Negative-total protection** | `final_total = max(0, cart_total - discount_amount)` |
| **Insufficient purchase** | HTTP 400 `{ detail: "ต้องซื้อขั้นต่ำ X บาท" }` |
| **Expired coupon** | HTTP 400 `{ detail: "คูปองหมดอายุ" }` |
| **Usage limit exceeded** | HTTP 400 `{ detail: "คุณใช้สิทธิ์ครบแล้ว" }` |
| **Test framework** | Jest 29 + axios (integration against live Docker container) |

### API Endpoint

| Method | Path | Body | Success Response |
|---|---|---|---|
| `POST` | `/api/calculate_discount` | `{ cart_total, coupons, user_id? }` | `200 { original_total, discount_amount, final_total, message }` |

### Pre-seeded In-memory Coupons

| Code | Type | Value | Min Purchase | Expires | Usage Limit |
|---|---|---|---|---|---|
| `SAVE100` | fixed | 100 | 500 | +30 days | none |
| `10PERCENT` | percentage | 10% | 0 | +30 days | none |
| `EXPIRED` | fixed | 50 | 0 | yesterday | none |
| `WELCOME` | fixed | 50 | 0 | +30 days | 1 per user |

Pre-seeded usage: `user123` → `WELCOME: 1` (already exhausted).

---

## 4. Test Script (`tests/scenarios.test.js`)

```javascript
const axios = require("axios");
const api = axios.create({ baseURL: "http://localhost:8000", validateStatus: () => true });

// No DB reset needed — backend uses in-memory data (no PostgreSQL)

// Scenario 1: { cart_total:1000, coupons:["SAVE100"] } → 200, final_total:900
// Scenario 2: { cart_total:2000, coupons:["10PERCENT"] } → 200, final_total:1800
// Scenario 3: { cart_total:1000, coupons:["EXPIRED"] } → 400, "คูปองหมดอายุ"
// Edge 1:  user_new + WELCOME → 200; user123 + WELCOME → 400, "คุณใช้สิทธิ์ครบแล้ว"
// Edge 2:  { cart_total:1000, coupons:["10PERCENT","SAVE100"] } → final_total:800
// Edge 3:  { cart_total:50, coupons:["WELCOME"], user_id:"user_brand_new" } → final_total:0
```

---

## 5. Key Differences vs PDBP01

| Aspect | PDBP01 (Node.js/Express + PostgreSQL) | PDAG01 (FastAPI/Python — AI-generated) |
|---|---|---|
| **Language / Framework** | Node.js + Express | Python + FastAPI |
| **Data storage** | PostgreSQL (real DB, truncated before each test) | In-memory Python dicts (no DB, no reset needed) |
| **Endpoints** | `POST /api/checkout/quote`, `POST /api/checkout/confirm` | `POST /api/calculate_discount` |
| **Coupon storage** | `coupons` table | `COUPONS_DB` dict in code |
| **Usage tracking** | `coupon_usage` table (persisted, reset between tests) | `USER_COUPON_USAGE` dict (static, pre-seeded) |
| **Amounts** | Satang (integer, × 100) | Baht (float) |
| **Auto-discount** | Via `x-auto-discount-percent` header | Coupon code `"10PERCENT"` |
| **Test approach** | `supertest` in-process + `pg` pool | `axios` (integration against Docker HTTP) |
| **DB port** | 5432 | N/A |
