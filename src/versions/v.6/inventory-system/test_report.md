# Inventory Management System Test Report (v.6)

**Date:** January 4, 2026
**Project Version:** inventory-system v.6

## 1. Test Summary

All scenarios defined in `scenarios_inventory.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced correctly, Log created (Type: SALE). |
| **2) Low Stock Alert Trigger** | ✅ PASS | Stock reduced, Low stock threshold triggered (Type: LOW_STOCK_ALERT). |
| **3) Stock Restoration** | ✅ PASS | Stock restored correctly via Restore API, Log created (Type: RESTOCK/RETURN). |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent requests, only 1 success, 4 failures. Stock did not go negative. |
| **Edge 2) Transaction Atomicity** | ✅ PASS | Verified rollback on DB error (simulated by dropping table). |
| **Edge 3) Overselling Attempt** | ✅ PASS | Request for more than available stock rejected with 409. |
| **Edge 4) Boundary Value** | ✅ PASS | Alert logic triggers correctly at threshold <= 5. |

---

## 2. Test Output

```text
 PASS  tests/inventory.test.js
  Inventory System Tests (v.6)
    ✓ Scenario 1: Successful Stock Deduction (69 ms)
    ✓ Scenario 2: Low Stock Alert Trigger (10 ms)
    ✓ Scenario 3: Stock Restoration (9 ms)
    ✓ Edge Case 1: Race Condition (124 ms)
    ✓ Edge Case 2: Transaction Atomicity (18 ms)
    ✓ Edge Case 3: Overselling Attempt (16 ms)
    ✓ Edge Case 4: Boundary Value (17 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.882 s, estimated 1 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Database Schema (`db/init.sql`)

```sql
CREATE TABLE IF NOT EXISTS products (
  id            BIGSERIAL PRIMARY KEY,
  sku           TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  stock         INTEGER NOT NULL CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_log (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  type        TEXT NOT NULL CHECK (type IN ('SALE', 'RESTOCK/RETURN', 'LOW_STOCK_ALERT')),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Backend: Purchase Logic (`backend/app.js`)

This function handles the purchase transaction, including locking (`FOR UPDATE`) to prevent race conditions and checking stock levels.

```javascript
app.post("/api/purchase", async (req, res) => {
  // ...
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock product row
    const { rows } = await client.query(
      `
      SELECT id, stock, low_stock_threshold
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [productId]
    );

    // ...

    // Overselling prevention: validate BEFORE any write
    if (quantity > product.stock) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Insufficient stock",
        available: product.stock,
        requested: quantity
      });
    }

    const remainingStock = product.stock - quantity;

    // Update stock
    await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [remainingStock, productId]);

    // SALE log (same transaction => atomic)
    await client.query(
      `
      INSERT INTO inventory_log (product_id, type, quantity, note)
      VALUES ($1, 'SALE', $2, $3)
      `,
      [productId, quantity, `Purchase deducted ${quantity}`]
    );

    // Low stock alert trigger (STRICT <=)
    const lowStockAlertTriggered = remainingStock <= threshold;

    if (lowStockAlertTriggered) {
      await client.query(
        `
        INSERT INTO inventory_log (product_id, type, quantity, note)
        VALUES ($1, 'LOW_STOCK_ALERT', 1, $2)
        `,
        [productId, `Low stock alert: remaining=${remainingStock} (<= ${threshold})`]
      );
    }

    await client.query("COMMIT");
    // ...
  } catch (err) {
    // Atomic rollback on any failure (including log failures)
    try { await client.query("ROLLBACK"); } catch (_) {}
    return res.status(500).json({ error: "Purchase failed (rolled back)", details: err.message });
  } finally {
    client.release();
  }
});
```

## 4. Test Script (`backend/tests/inventory.test.js`)

The Jest test file used to verify the scenarios.

```javascript
const request = require("supertest");
const app = require("../app");
const { pool } = require("../db");

describe("Inventory System Tests (v.6)", () => {
  beforeAll(async () => {
    // Ensure tables exist matching v.6 app.js usage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 5,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      // ...
    `);
  });

  // ...

  test("Scenario 1: Successful Stock Deduction", async () => {
    // SKU-001 has 10. Buy 2.
    const res = await request(app)
      .post("/api/purchase")
      .send({ productId: 1, quantity: 2 })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.remainingStock).toBe(8);

    // Check DB
    const { rows } = await pool.query("SELECT stock FROM products WHERE id=1");
    expect(rows[0].stock).toBe(8);
  });

  test("Edge Case 1: Race Condition", async () => {
    // SKU-004 has 1. 5 concurrent requests for 1.
    const requests = Array(5).fill().map(() => 
      request(app).post("/api/purchase").send({ productId: 4, quantity: 1 })
    );

    const results = await Promise.all(requests);

    const successCount = results.filter(r => r.status === 200).length;
    const failCount = results.filter(r => r.status === 409).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(4);

    const { rows } = await pool.query("SELECT stock FROM products WHERE id=4");
    expect(rows[0].stock).toBe(0);
  });

  // ...
});
```
