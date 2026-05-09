# Inventory Management System Test Report

**Date:** May 9, 2026
**Project Version:** IMBP02 (Basic Prompt — Version 2)

## 1. Test Summary

All scenarios defined in `scenarios_inventory.md` have been tested using Jest + Supertest against the Express in-memory backend.

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ❌ FAIL | Stock ลดถูกต้อง (10→8) แต่ `stockHistory` ไม่มี field `type` — ไม่สามารถระบุประเภท "SALE" ได้ |
| **2) Low Stock Alert Trigger** | ✅ PASS | Stock ลดเหลือ 4, item ปรากฏใน `/api/inventory/low-stock` |
| **3) Stock Restoration** | ❌ FAIL | ไม่มี endpoint `/api/inventory/restock/:id` — คืนสต็อกไม่ได้ |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent requests, 1 สำเร็จ, 4 ล้มเหลว, stock = 0 ไม่ติดลบ |
| **Edge 2) Transaction Atomicity** | ✅ PASS | In-memory atomicity ทำงานถูกต้อง (stock + log consistent เสมอ) |
| **Edge 3) Overselling Attempt** | ✅ PASS | ปฏิเสธ request ที่ซื้อเกิน stock ด้วย HTTP 400 |
| **Edge 4) Boundary Value** | ❌ FAIL | Low stock ใช้ `< 5` แทน `<= 5` — stock = 5 ไม่ถูกแจ้งเตือนตามสเปก |

**สรุป: 4 passed / 3 failed**

---

## 2. Test Output

```text
FAIL tests/inventory.test.js
  Inventory System Tests - IMBP02
    ✕ Test 1: Successful Stock Deduction (17 ms)
    ✓ Test 2: Low Stock Alert Trigger (10 ms)
    ✕ Test 3: Stock Restoration (3 ms)
    ✓ Edge Case 1: Race Condition (5 ms)
    ✓ Edge Case 2: Transaction Atomicity (1 ms)
    ✓ Edge Case 3: Overselling Attempt
    ✕ Edge Case 4: Boundary Value (threshold <= 5) (2 ms)

Tests: 3 failed, 4 passed, 7 total
Time:  0.253 s
```

### Failure Details

**Test 1 — ไม่มี field `type` ใน stockHistory:**
```
Expected: "SALE"
Received: undefined
```

**Test 3 — ไม่มี restock endpoint:**
```
Expected: 200
Received: 404
```

**Edge Case 4 — Operator ผิด (`<` แทน `<=`):**
```
expect(received).toBeDefined()
Received: undefined   // stock=5 ไม่ปรากฏใน /api/inventory/low-stock
```

---

## 3. Code Implementation Details

### Backend: In-Memory Data Store (`server.js`)

```javascript
const LOW_STOCK_THRESHOLD = 5;

let inventory = [
  { id: 1, name: "Laptop",   stock: 10 },
  { id: 2, name: "Mouse",    stock: 3  },
  { id: 3, name: "Keyboard", stock: 7  }
];

let stockHistory = [];
```

### Backend: Purchase Logic

```javascript
app.post("/api/inventory/purchase/:id", (req, res) => {
  const item = inventory.find(i => i.id === itemId);
  if (item.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock" });
  }
  item.stock -= quantity;
  stockHistory.push({ itemId: item.id, name: item.name, change: -quantity, date: new Date() });
  if (item.stock < LOW_STOCK_THRESHOLD) { // BUG: ควรใช้ <= 5
    console.log(`LOW STOCK WARNING: ...`);
  }
  res.json({ message: "Purchase successful", item });
});
```

### Gaps พบจากการทดสอบ

| ช่องว่าง | รายละเอียด |
|---|---|
| ไม่มี Log type | `stockHistory` ไม่มี field `type` ("SALE"/"RESTOCK") |
| ไม่มี Restock endpoint | ไม่สามารถคืนสต็อกผ่าน API ได้ |
| Boundary operator ผิด | ใช้ `< 5` แทน `<= 5` ทำให้ stock=5 ไม่ถูกแจ้งเตือน |
| ไม่มี DB/Transaction | ใช้ in-memory เท่านั้น ไม่รองรับ persistence |

---

## 4. Test Script (`backend/tests/inventory.test.js`)

```javascript
const request = require("supertest");
const { app, resetInventory, inventory, stockHistory } = require("../server");

describe("Inventory System Tests - IMBP02", () => {
  beforeEach(() => resetInventory());

  test("Test 1: Successful Stock Deduction", async () => {
    const res = await request(app)
      .post("/api/inventory/purchase/1").send({ quantity: 2 }).expect(200);
    const item = inventory.find(i => i.id === 1);
    expect(item.stock).toBe(8);
    const log = stockHistory.find(h => h.itemId === 1 && h.change === -2);
    expect(log.type).toBe("SALE"); // FAIL
  });

  test("Test 2: Low Stock Alert Trigger", async () => {
    await request(app).post("/api/inventory/purchase/2").send({ quantity: 2 }).expect(200);
    const item = inventory.find(i => i.id === 2);
    expect(item.stock).toBe(4);
    const lowRes = await request(app).get("/api/inventory/low-stock").expect(200);
    expect(lowRes.body.find(i => i.id === 2)).toBeDefined();
  });

  test("Test 3: Stock Restoration", async () => {
    await request(app).post("/api/inventory/purchase/3").send({ quantity: 1 }).expect(200);
    const res = await request(app).post("/api/inventory/restock/3").send({ quantity: 1 });
    expect(res.status).toBe(200); // FAIL: 404
  });

  test("Edge Case 1: Race Condition", async () => {
    const requests = Array(5).fill().map(() =>
      request(app).post("/api/inventory/purchase/4").send({ quantity: 1 })
    );
    const results = await Promise.all(requests);
    expect(results.filter(r => r.status === 200).length).toBe(1);
    expect(results.filter(r => r.status !== 200).length).toBe(4);
    expect(inventory.find(i => i.id === 4).stock).toBe(0);
  });

  test("Edge Case 2: Transaction Atomicity", async () => {
    await request(app).post("/api/inventory/purchase/1").send({ quantity: 1 }).expect(200);
    expect(inventory.find(i => i.id === 1).stock).toBe(9);
    expect(stockHistory.find(h => h.itemId === 1 && h.change === -1)).toBeDefined();
  });

  test("Edge Case 3: Overselling Attempt", async () => {
    const res = await request(app).post("/api/inventory/purchase/5").send({ quantity: 6 });
    expect(res.status).toBe(400);
    expect(inventory.find(i => i.id === 5).stock).toBe(5);
  });

  test("Edge Case 4: Boundary Value (threshold <= 5)", async () => {
    await request(app).post("/api/inventory/purchase/6").send({ quantity: 1 }).expect(200);
    let low = (await request(app).get("/api/inventory/low-stock")).body;
    expect(low.find(i => i.id === 6)).toBeUndefined(); // stock=6, no alert

    await request(app).post("/api/inventory/purchase/6").send({ quantity: 1 }).expect(200);
    low = (await request(app).get("/api/inventory/low-stock")).body;
    expect(low.find(i => i.id === 6)).toBeDefined(); // stock=5, FAIL: server ใช้ < 5

    await request(app).post("/api/inventory/purchase/6").send({ quantity: 1 }).expect(200);
    low = (await request(app).get("/api/inventory/low-stock")).body;
    expect(low.find(i => i.id === 6)).toBeDefined(); // stock=4, pass
  });
});
```
