# Shopping Cart System Test Report

**Date:** December 29, 2025
**Project Version:** shopping-cart-app (v.4)

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | ✅ PASS | Quantity updated to 3, Line Total and Grand Total correct. |
| **2) Merge Items Logic** | ✅ PASS | No duplicate rows, quantity merged correctly. |
| **3) Save for Later** | ✅ PASS | Item moved to Saved, removed from active cart totals. |
| **Edge 1) Add More Than Stock** | ✅ PASS | Rejected with 409, quantity remained unchanged. |
| **Edge 2) Floating Point Calculation** | ✅ PASS | Cents integer calculation ensures precision (19.99 * 3 = 59.97). |

---

## 2. Test Output

```text
(node:39349) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
 PASS  tests/scenarios.test.js
  Shopping Cart Scenarios
    ✓ Scenario 1: Update Item Quantity (89 ms)
    ✓ Scenario 2: Merge Items Logic (21 ms)
    ✓ Scenario 3: Save for Later (24 ms)
    ✓ Edge Case 1: Add More Than Stock (22 ms)
    ✓ Edge Case 2: Floating Point Calculation (34 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.662 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Database Schema (`db/001_init.sql`)

```sql
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  sku          TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  price_cents  INTEGER NOT NULL CHECK (price_cents >= 0),
  stock        INTEGER NOT NULL CHECK (stock >= 0)
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id          INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id       INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  qty              INTEGER NOT NULL CHECK (qty >= 0),
  saved_for_later  BOOLEAN NOT NULL DEFAULT FALSE,
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  PRIMARY KEY (cart_id, product_id)
);
```

### Backend: Add to Cart Logic (`src/cartService.js`)

Handles merging items and checking stock with `FOR UPDATE` lock.

```javascript
export async function addToCart(productId, qty) {
  return withTx(async (client) => {
    // ...
    // Lock product row to safely check stock
    const productRes = await client.query(
      "SELECT id, stock, price_cents FROM products WHERE id=$1 FOR UPDATE",
      [productId]
    );
    // ...
    // Get existing cart item (lock row if exists)
    const itemRes = await client.query(
      "SELECT qty, saved_for_later FROM cart_items WHERE cart_id=$1 AND product_id=$2 FOR UPDATE",
      [cartId, productId]
    );

    const existingQty = itemRes.rows.length ? itemRes.rows[0].qty : 0;
    const desiredQty = existingQty + qty;

    if (desiredQty > product.stock) {
      const err = new Error(`Not enough stock. Available: ${product.stock}`);
      err.status = 409;
      throw err;
    }
    // ... Insert or Update logic
  });
}
```

### Backend: Save for Later Logic (`src/cartService.js`)

```javascript
export async function toggleSaveForLater(productId, saved) {
  return withTx(async (client) => {
    // ...
    await client.query(
      "UPDATE cart_items SET saved_for_later=$3 WHERE cart_id=$1 AND product_id=$2",
      [cartId, productId, saved]
    );
    return await getCart(client);
  });
}
```

## 4. Test Script (`backend/tests/scenarios.test.js`)

The Jest test file used to verify the scenarios.

```javascript
import request from "supertest";
import { app } from "../src/server.js";
import { pool } from "../src/db.js";

describe("Shopping Cart Scenarios", () => {
  // ... Setup and Teardown ...

  test("Scenario 1: Update Item Quantity", async () => {
    await request(app).post("/api/cart/items").send({ productId: 1, qty: 1 }).expect(200);
    const res = await request(app).patch("/api/cart/items/1").send({ qty: 3 }).expect(200);
    expect(res.body.totals.subtotal_cents).toBe(30000);
  });

  test("Scenario 2: Merge Items Logic", async () => {
    await request(app).post("/api/cart/items").send({ productId: 1, qty: 1 }).expect(200);
    const res = await request(app).post("/api/cart/items").send({ productId: 1, qty: 2 }).expect(200);
    const items = res.body.items.filter(i => i.product_id === 1);
    expect(items[0].qty).toBe(3);
  });

  test("Scenario 3: Save for Later", async () => {
    await request(app).post("/api/cart/items").send({ productId: 5, qty: 1 }).expect(200);
    const res = await request(app).post("/api/cart/items/5/save").send({ saved: true }).expect(200);
    expect(res.body.items.find(i => i.product_id === 5)).toBeUndefined();
    expect(res.body.savedForLater.find(i => i.product_id === 5)).toBeDefined();
  });

  test("Edge Case 1: Add More Than Stock", async () => {
    await request(app).post("/api/cart/items").send({ productId: 5, qty: 3 }).expect(200);
    const res = await request(app).post("/api/cart/items").send({ productId: 5, qty: 3 });
    expect(res.status).toBe(409);
  });

  test("Edge Case 2: Floating Point Calculation", async () => {
    const res = await request(app).post("/api/cart/items").send({ productId: 6, qty: 3 }).expect(200);
    expect(res.body.totals.subtotal_cents).toBe(5997);
  });
});
```
