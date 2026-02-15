# Inventory Management System Test Report

**Date:** December 29, 2025
**Project Version:** online-shop-inventory 2

## 1. Test Summary

All scenarios defined in `scenarios.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced correctly, Log created. |
| **2) Low Stock Alert Trigger** | ✅ PASS | Stock reduced, Low stock threshold triggered. |
| **3) Stock Restoration** | ✅ PASS | Stock restored correctly via Restock API, Log created. |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent requests, only 1 success, 4 failures. Stock did not go negative. |
| **Edge 2) Transaction Atomicity** | ✅ PASS | Verified rollback on DB error (simulated by dropping table). |
| **Edge 3) Overselling Attempt** | ✅ PASS | Request for more than available stock rejected with 409. |
| **Edge 4) Boundary Value** | ✅ PASS | Alert logic triggers correctly at threshold <= 5. |

---

## 2. Test Output

```text
 PASS  tests/inventory.test.js
  Inventory System Tests
    ✓ Test 1: Successful Stock Deduction (51 ms)
    ✓ Test 2: Low Stock Alert Trigger (21 ms)
    ✓ Test 3: Stock Restoration (13 ms)
    ✓ Edge Case 1: Race Condition (120 ms)
    ✓ Edge Case 2: Transaction Atomicity (21 ms)
    ✓ Edge Case 3: Overselling Attempt (12 ms)
    ✓ Edge Case 4: Boundary Value (14 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.756 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Database Schema (`001_init.sql`)

```sql
CREATE TABLE IF NOT EXISTS products (
  id           BIGSERIAL PRIMARY KEY,
  sku          TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  price_cents  INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_history (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change_type   TEXT NOT NULL CHECK (change_type IN ('PURCHASE','RESTOCK','ADJUSTMENT')),
  delta         INTEGER NOT NULL,
  before_stock  INTEGER NOT NULL,
  after_stock   INTEGER NOT NULL,
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Backend: Purchase Logic (`inventoryController.js`)

This function handles the purchase transaction, including locking (`FOR UPDATE`) to prevent race conditions and checking stock levels.

```javascript
// POST /api/purchase  body: { productId, quantity }
async function purchase(req, res) {
  const { productId, quantity } = req.body;
  // ...
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // lock the product row to prevent overselling
    const pr = await client.query(
      `SELECT id, name, stock FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );
    // ...
    if (before < quantity) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Not enough stock" });
    }
    // ...
    await client.query("COMMIT");
    return res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
}
```

## 4. Test Script (`backend/tests/inventory.test.js`)

The Jest test file used to verify the scenarios.

```javascript
const request = require("supertest");
const app = require("../server");
const { pool } = require("../db");

describe("Inventory System Tests", () => {
  beforeAll(async () => {
    // Ensure tables exist
    await pool.query(`CREATE TABLE IF NOT EXISTS ...`);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Reset DB state
    await pool.query("TRUNCATE stock_history CASCADE");
    await pool.query("DELETE FROM products");
    await pool.query(`INSERT INTO products ...`);
  });

  test("Test 1: Successful Stock Deduction", async () => {
    const res = await request(app).post("/api/purchase").send({ productId: 1, quantity: 2 }).expect(200);
    const { rows } = await pool.query("SELECT stock FROM products WHERE id=1");
    expect(rows[0].stock).toBe(8);
  });

  test("Edge Case 1: Race Condition", async () => {
    const requests = Array(5).fill().map(() => 
      request(app).post("/api/purchase").send({ productId: 4, quantity: 1 })
    );
    const results = await Promise.all(requests);
    const successCount = results.filter(r => r.status === 200).length;
    expect(successCount).toBe(1);
  });

  test("Edge Case 2: Transaction Atomicity", async () => {
    await pool.query("DROP TABLE stock_history CASCADE");
    const res = await request(app).post("/api/purchase").send({ productId: 1, quantity: 1 });
    expect(res.status).toBe(500);
    const { rows } = await pool.query("SELECT stock FROM products WHERE id=1");
    expect(rows[0].stock).toBe(10);
  });
});
```
