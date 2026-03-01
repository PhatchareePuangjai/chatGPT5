# Promotions and Discounts System Test Report (PDCS01)

**Date:** March 1, 2026
**Project Version:** promotions-app PDCS01

## 1. Test Summary

All scenarios defined in `scenarios_promotions.md` have been tested using Jest (integration tests against the running Docker stack).

| Scenario | Result | Notes |
|---|---|---|
| **1) Coupon Validation** | ✅ PASS | Min purchase condition met (1,000 ≥ 500 บาท), fixed discount 100 บาท applied correctly. |
| **2) Cart Total Discount %** | ✅ PASS | 10% discount applied correctly: 2,000 × 10% = 200 บาท, grand total 1,800 บาท. |
| **3) Expiration Date Check** | ✅ PASS | Expired coupon rejected, cart total unchanged. |
| **Edge 1) Coupon Usage Limit** | ✅ PASS | One-time use coupon rejected on second attempt by same user. |
| **Edge 2) Order of Operations** | ✅ PASS | Verified: (1,000 - 10%) - 100 = 800 บาท (percent priority first, then fixed). |
| **Edge 3) Negative Total Protection** | ✅ PASS | Grand total clamped to 0 when fixed discount (100 บาท) > cart total (50 บาท). |

---

## 2. Test Output

```text
 PASS  ./scenarios.test.js
  Promotions and Discounts Scenarios (PDCS01)
    ✓ Scenario 1: Coupon Validation — Min purchase 500 บาท, Save 100 บาท (193 ms)
    ✓ Scenario 2: Cart Total Discount % — ลด 10% ท้ายบิล (52 ms)
    ✓ Scenario 3: Expiration Date Check — คูปองหมดอายุ (69 ms)
    ✓ Edge Case 1: Coupon Usage Limit — WELCOME ใช้ได้ 1 ครั้ง/คน (60 ms)
    ✓ Edge Case 2: Order of Operations — (1,000 - 10%) - 100 = 800 บาท (68 ms)
    ✓ Edge Case 3: Negative Total Protection — ยอดสุทธิต้องไม่ติดลบ (39 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.864 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Database Schema (`db/migrations/001_init.sql`)

```sql
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('fixed', 'percent')),
    value_cents INTEGER NOT NULL DEFAULT 0,
    value_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    min_subtotal_cents INTEGER NOT NULL DEFAULT 0,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    usage_limit_per_user INTEGER NOT NULL DEFAULT 1,
    priority_override INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    subtotal_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'THB',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_discounts (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    coupon_code TEXT NOT NULL REFERENCES coupons(code),
    amount_cents INTEGER NOT NULL,
    priority INTEGER NOT NULL,        -- 1 = percent (applied first), 2 = fixed
    discount_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_usages (
    id SERIAL PRIMARY KEY,
    coupon_code TEXT NOT NULL REFERENCES coupons(code) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    times_used INTEGER NOT NULL DEFAULT 0,
    UNIQUE (coupon_code, user_id)
);
```

### Backend: Coupon Application Logic (`src/services/promotionService.js`)

Handles the full validation chain and discount calculation with the correct order of operations (percent → fixed) and negative total protection.

```javascript
function validateDateWindow(coupon) {
  const now = new Date();
  if (now < coupon.start_at || now > coupon.end_at) {
    throw errorFactory.expired();   // → HTTP 400, reason: "expired"
  }
}

function validateMinimum(cart, coupon) {
  if (cart.subtotal_cents < coupon.min_subtotal_cents) {
    throw errorFactory.minSpend();  // → HTTP 400, reason: "min_spend_failed"
  }
}

async function validateUsage(userId, coupon) {
  const usage = await usageRepository.getUsage(userId, coupon.code);
  if (usage && usage.times_used >= coupon.usage_limit_per_user) {
    throw errorFactory.usageLimit(); // → HTTP 400, reason: "usage_limit"
  }
}

function computeDiscountAmount(cart, coupon) {
  if (coupon.type === 'percent') {
    return percentOf(cart.subtotal_cents, coupon.value_percent);
  }
  return coupon.value_cents;
}

// Grand total safety — never goes negative (clampZero = Math.max(0, ...))
const totalDiscount = clampZero(sumCents(discounts.map((d) => d.amount_cents)));
const grand = clampZero(cart.subtotal_cents - totalDiscount);
```

### Backend: Discount Priority (`src/services/promotionService.js`)

```javascript
function determinePriority(coupon) {
  // percent coupon → priority 1 (applied first)
  // fixed coupon  → priority 2 (applied second)
  if (coupon.priority_override) return coupon.priority_override;
  return coupon.type === 'percent' ? 1 : 2;
}
```

This ensures **percent discounts are always applied before fixed discounts**, matching the business rule: `(subtotal - 10%) - fixed = grand total`.

---

## 4. Test Script (`tests/scenarios.test.js`)

Integration tests run against the live Docker stack (`http://localhost:4000`), verifying each scenario end-to-end via HTTP + direct DB queries.

```javascript
const api = axios.create({ baseURL: "http://localhost:4000", validateStatus: () => true });
const pool = new Pool({ host: "127.0.0.1", port: 5434, user: "promo",
                        password: "promo", database: "promotions" });

test("Scenario 1: Coupon Validation", async () => {
  const userId = "user-scenario-1";
  await pool.query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 100000]);

  const res = await api.post("/api/promotions/apply", { userId, couponCode: "SAVE100" });

  expect(res.status).toBe(200);
  expect(res.data.applied_discount_cents).toBe(10000);
  expect(res.data.cart.grand_total_cents).toBe(90000);
});

test("Edge Case 2: Order of Operations", async () => {
  const userId = "user-edge-2";
  await pool.query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 100000]);

  // Apply percent first (priority 1)
  await api.post("/api/promotions/apply", { userId, couponCode: "CART10" });

  // Apply fixed second (priority 2)
  const res = await api.post("/api/promotions/apply", { userId, couponCode: "SAVE100" });

  // (100,000 - 10%) - 10,000 = 80,000 cents = 800 บาท
  expect(res.data.cart.discount_total_cents).toBe(20000);
  expect(res.data.cart.grand_total_cents).toBe(80000);
});
```

---

## 5. Key Differences vs PDCE01

| Aspect | PDCE01 (Express + raw SQL) | PDCS01 (Express + layered arch) |
|---|---|---|
| **Architecture** | Single `app.js` controller | Repository → Service → Route layers |
| **Coupon data model** | `percent_bps` + `fixed_discount_satang` | `value_percent` + `value_cents`, `type` field |
| **Alert/error codes** | `COUPON_EXPIRED`, `COUPON_OVERUSED` | `reason: "expired"`, `reason: "usage_limit"` |
| **Discount tracking** | Columns on `orders` table | Separate `cart_discounts` table (multi-coupon) |
| **Usage tracking** | `user_coupon_history` table | `coupon_usages` table with `times_used` counter |
| **Negative protection** | `Math.max(0, afterFixed)` in controller | `clampZero()` utility in service layer |
| **DB port (host)** | 5432 | 5434 |
| **Test approach** | `supertest` + mock DB (`jest.mock`) | `axios` + real Docker DB (integration) |
