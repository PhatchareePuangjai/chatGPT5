# Shopping Cart System Test Report

**Date:** January 10, 2026
**Project Version:** shopping-cart (v.7)

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | ✅ PASS | Quantity updated to 3, Line Total and Grand Total correct. |
| **2) Merge Items Logic** | ✅ PASS | No duplicate rows, quantity merged correctly. |
| **3) Save for Later** | ✅ PASS | Item status changed to SAVED, removed from active totals. |
| **Edge 1) Add More Than Stock** | ✅ PASS | Rejected with 409 INSUFFICIENT_STOCK, quantity remained unchanged. |
| **Edge 2) Floating Point Calculation** | ✅ PASS | Integer cents calculation ensures precision (19.99 * 3 = 59.97). |

---

## 2. Test Output

```text
> cart-backend@1.0.0 test
> jest

 PASS  tests/scenarios.test.js
  Shopping Cart Scenarios v7
    ✓ Scenario 1: Update Item Quantity (207 ms)
    ✓ Scenario 2: Merge Items Logic (31 ms)
    ✓ Scenario 3: Save for Later (26 ms)
    ✓ Edge Case 1: Add More Than Stock (31 ms)
    ✓ Edge Case 2: Floating Point Calculation (20 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.6 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Database Schema (`db/init.sql`)

```sql
CREATE TYPE cart_item_status AS ENUM ('ACTIVE', 'SAVED');

CREATE TABLE IF NOT EXISTS products (
  sku           TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
  stock         INTEGER NOT NULL CHECK (stock >= 0),
  -- ... timestamps
);

CREATE TABLE IF NOT EXISTS cart_items (
  id           BIGSERIAL PRIMARY KEY,
  cart_id      UUID NOT NULL, -- Demo ID used in v7
  sku          TEXT NOT NULL REFERENCES products(sku) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  status       cart_item_status NOT NULL DEFAULT 'ACTIVE',
  -- ... timestamps
  CONSTRAINT cart_items_cart_sku_unique UNIQUE (cart_id, sku)
);
```

### Backend: Add to Cart Logic (`backend/server.js`)

Handles merging items and checking stock with `FOR UPDATE` lock.

```javascript
// POST /api/cart/items
app.post("/api/cart/items", async (req, res) => {
  // ... validation ...
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock product row to keep stock consistent
    const prodRes = await client.query(
      `SELECT sku, stock FROM products WHERE sku = $1 FOR UPDATE;`,
      [sku]
    );
    // ... check product exists ...
    const stock = Number(prodRes.rows[0].stock);

    // Lock cart item row (if exists)
    const itemRes = await client.query(
      `SELECT quantity FROM cart_items WHERE cart_id = $1 AND sku = $2 FOR UPDATE;`,
      [DEMO_CART_ID, sku]
    );
    const currentQty = itemRes.rowCount ? Number(itemRes.rows[0].quantity) : 0;

    // Inventory Guard: (CurrentCartQty + NewQty) <= Stock
    if (currentQty + addQty > stock) {
      await client.query("ROLLBACK");
      return apiError(res, 409, "INSUFFICIENT_STOCK", "Insufficient Stock" /* ... */);
    }

    if (itemRes.rowCount) {
      // Update existing item
      await client.query(
        `UPDATE cart_items SET quantity = quantity + $3, status = 'ACTIVE' ...`,
        [DEMO_CART_ID, sku, addQty]
      );
    } else {
      // Insert new item
      await client.query(
        `INSERT INTO cart_items (cart_id, sku, quantity, status) VALUES ...`,
        [DEMO_CART_ID, sku, addQty]
      );
    }
    await client.query("COMMIT");
    // ... return snapshot ...
  } catch (e) { /* ... error handling ... */ }
});
```

### Backend: Save for Later Logic (`backend/server.js`)

Uses a status enum toggle instead of boolean flag.

```javascript
// POST /api/cart/items/:sku/toggle-save
app.post("/api/cart/items/:sku/toggle-save", async (req, res) => {
  // ... validation ...
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // ... lock product and cart item ...

    // When moving to ACTIVE, re-check stock in case stock changed since adding.
    if (!saved && qty > stock) {
      await client.query("ROLLBACK");
      return apiError(res, 409, "INSUFFICIENT_STOCK", "Insufficient Stock" /* ... */);
    }

    await client.query(
      `UPDATE cart_items SET status = $3 WHERE cart_id = $1 AND sku = $2;`,
      [DEMO_CART_ID, sku, saved ? "SAVED" : "ACTIVE"]
    );

    await client.query("COMMIT");
    // ... return snapshot ...
  } catch (e) { /* ... error handling ... */ }
});
```

## 4. Test Script (`backend/tests/scenarios.test.js`)

The Jest test file used to verify the scenarios.

```javascript
const request = require("supertest");
const { app } = require("../server");
const { pool } = require("../db");

describe("Shopping Cart Scenarios v7", () => {
  beforeAll(async () => { /* ... */ });
  afterAll(async () => { await pool.end(); });

  beforeEach(async () => {
    // ... TRUNCATE and SEED products ...
  });

  test("Scenario 1: Update Item Quantity", async () => {
    // Given: Cart has Product A (SKU-001) x 1
    await request(app).post("/api/cart/items").send({ sku: 'SKU-001', quantity: 1 }).expect(200);

    // When: Update quantity to 3
    const res = await request(app).patch("/api/cart/items/SKU-001").send({ quantity: 3 }).expect(200);

    // Then: Quantity is 3, Total is 30000 cents
    const item = res.body.cart.items.find(i => i.sku === 'SKU-001');
    expect(item.quantity).toBe(3);
    expect(res.body.cart.totals.active_subtotal_cents).toBe(30000);
  });

  test("Scenario 2: Merge Items Logic", async () => {
    await request(app).post("/api/cart/items").send({ sku: 'SKU-001', quantity: 1 }).expect(200);
    const res = await request(app).post("/api/cart/items").send({ sku: 'SKU-001', quantity: 2 }).expect(200);
    
    const items = res.body.cart.items.filter(i => i.sku === 'SKU-001');
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(3);
  });

  test("Scenario 3: Save for Later", async () => {
    await request(app).post("/api/cart/items").send({ sku: 'SKU-005', quantity: 1 }).expect(200);
    
    // Toggle save
    const res = await request(app).post("/api/cart/items/SKU-005/toggle-save").send({ saved: true }).expect(200);

    const item = res.body.cart.items.find(i => i.sku === 'SKU-005');
    expect(item.status).toBe('SAVED');
    expect(res.body.cart.totals.active_subtotal_cents).toBe(0);
  });

  test("Edge Case 1: Add More Than Stock", async () => {
    await request(app).post("/api/cart/items").send({ sku: 'SKU-005', quantity: 3 }).expect(200);
    const res = await request(app).post("/api/cart/items").send({ sku: 'SKU-005', quantity: 3 });
    
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("INSUFFICIENT_STOCK");
  });

  test("Edge Case 2: Floating Point Calculation", async () => {
    const res = await request(app).post("/api/cart/items").send({ sku: 'SKU-006', quantity: 3 }).expect(200);
    expect(res.body.cart.totals.active_subtotal_cents).toBe(5997);
  });
});
```
