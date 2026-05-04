# Inventory Management System Test Report

**Date:** May 4, 2026
**Project Version:** one-click-online-shop (IMBP02)

## 1. Test Summary

All scenarios defined in `scenarios_inventory.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced correctly from 10 → 8. |
| **2) Low Stock Alert Trigger** | ✅ PASS | Stock reduced to 4, LOW STOCK log triggered (console.log). |
| **3) Stock Restoration** | ⚠️ PARTIAL | Buy reduces stock correctly, but no restock/cancel endpoint exists — cannot fully restore stock. |
| **Edge 1) Race Condition** | ❌ FAIL | 5 concurrent requests, all 5 succeeded (ควร 1 เท่านั้น). Code ไม่มี DB Locking/Transaction. |
| **Edge 2) Transaction Atomicity** | ⚠️ PARTIAL | Buy reduces stock, but no InventoryLog table — atomicity (all-or-nothing) ไม่ได้ implement. |
| **Edge 3) Overselling Attempt** | ✅ PASS | Request for more than available stock rejected with 400. |
| **Edge 4) Boundary Value** | ⚠️ PARTIAL | Stock reduced to 4. แต่ code ใช้ `newStock < 5` (strict) แทน `<= 5` — เมื่อ stock = 5 ไม่ trigger alert (Bug). |

---

## 2. Test Output

```text
FAIL tests/inventory.test.js
  Inventory System Tests (IMBP02)
    ✓ Test 1: Successful Stock Deduction (19 ms)
    ✓ Test 2: Low Stock Alert Trigger (12 ms)
    ✓ Test 3: Stock Restoration (No Restock Endpoint) (2 ms)
    ✕ Edge Case 1: Race Condition (7 ms)
    ✓ Edge Case 2: Transaction Atomicity (2 ms)
    ✓ Edge Case 3: Overselling Attempt (1 ms)
    ✓ Edge Case 4: Boundary Value (Low Stock Threshold ≤ 5) (3 ms)

  ● Edge Case 1: Race Condition
    Expected: 1
    Received: 5

Test Suites: 1 failed, 1 total
Tests:       1 failed, 6 passed, 7 total
Time:        0.248 s
```

---

## 3. Code Implementation Details

### Backend: Database Schema (`server.js`)

```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
  )
`);
```

> ไม่มีตาราง `InventoryLog` หรือ `stock_history` — ข้อมูลการเคลื่อนไหว Stock ไม่ถูกบันทึก

### Backend: Purchase Logic (`server.js`)

```javascript
app.post("/buy/:id", (req, res) => {
  const id = req.params.id;
  const quantity = req.body.quantity;

  db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {
    if (!product) return res.status(404).json({ error: "Not found" });
    if (product.stock < quantity)
      return res.status(400).json({ error: "Not enough stock" });

    const newStock = product.stock - quantity;
    db.run("UPDATE products SET stock = ? WHERE id = ?", [newStock, id]);

    if (newStock < 5) {  // Bug: ควรเป็น <= 5 ตาม spec
      console.log(`LOW STOCK: ${product.name} (${newStock} left)`);
    }

    res.json({ message: "OK" });
  });
});
```

**ปัญหาที่พบ:**
1. **Race Condition**: `SELECT` และ `UPDATE` แยกกัน ไม่อยู่ใน Transaction → Request พร้อมกันทุกตัว อ่าน stock=1 แล้วทุกตัว update สำเร็จ
2. **Low Stock Bug**: ใช้ `< 5` แทน `<= 5` → stock = 5 ไม่ trigger alert
3. **ไม่มี InventoryLog**: การตัด stock ไม่มี audit trail

---

## 4. Test Script (`tests/inventory.test.js`)

```javascript
describe("Inventory System Tests (IMBP02)", () => {
  beforeEach(async () => { await seed(); });
  afterAll((done) => { db.close(done); });

  test("Test 1: Successful Stock Deduction", async () => {
    const res = await request(app).post("/buy/1").send({ quantity: 2 });
    expect(res.status).toBe(200);
    const product = await getProduct(1);
    expect(product.stock).toBe(8);
  });

  test("Edge Case 1: Race Condition", async () => {
    const requests = Array(5).fill(null)
      .map(() => request(app).post("/buy/4").send({ quantity: 1 }));
    const results = await Promise.all(requests);
    const successCount = results.filter(r => r.status === 200).length;
    expect(successCount).toBe(1); // FAILS: received 5
  });
  // ...
});
```
