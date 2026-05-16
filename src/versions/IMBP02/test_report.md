# Inventory Management System Test Report

**Date:** May 16, 2026
**Project Version:** inventory-management-system (IMBP02)

## 1. Test Summary

All scenarios defined in `scenarios_inventory.md` have been tested using Jest against the in-memory backend.

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced correctly, history log created. |
| **2) Low Stock Alert Trigger** | ✅ PASS | Stock reduced to 4, low-stock endpoint returns the item. |
| **3) Stock Restoration** | ❌ FAIL | `POST /api/inventory/restock` not implemented (returns 404). |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent requests, only 1 success, 4 failures. Stock did not go negative. |
| **Edge 2) Transaction Atomicity** | ✅ PASS | Invalid purchase does not modify stock or history. |
| **Edge 3) Overselling Attempt** | ✅ PASS | Request for more than available stock rejected with 400. |
| **Edge 4) Boundary Value** | ❌ FAIL | Threshold bug: code uses `stock < 5` but scenario requires `stock <= 5`. Stock=5 does not trigger alert. |

---

## 2. Test Output

```text
FAIL tests/inventory.test.js
  Inventory System Tests — IMBP02
    Acceptance Scenarios
      ✓ Test 1: Successful Stock Deduction (54 ms)
      ✓ Test 2: Low Stock Alert Trigger (17 ms)
      ✕ Test 3: Stock Restoration (12 ms)
    Edge Cases
      ✓ Edge Case 1: Race Condition (13 ms)
      ✓ Edge Case 2: Transaction Atomicity — Failed purchase does not modify state (11 ms)
      ✓ Edge Case 3: Overselling Attempt (11 ms)
      ✕ Edge Case 4: Boundary Value — Low stock threshold (13 ms)

  ● Test 3: Stock Restoration
    Expected: 200  /  Received: 404
    → POST /api/inventory/restock is not implemented

  ● Edge Case 4: Boundary Value
    expect(received).toBeDefined() → Received: undefined
    → stock=5 not returned by /api/inventory/low-stock (code uses < 5, not <= 5)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 5 passed, 7 total
Time:        0.273 s
```

---

## 3. Bugs Found

### Bug 1 — Missing Restock Endpoint
- **Scenario:** Test 3 (Stock Restoration)
- **Expected:** `POST /api/inventory/restock` restores stock and logs a RESTOCK entry
- **Actual:** Route does not exist → 404

### Bug 2 — Low Stock Threshold Off-by-One
- **Scenario:** Edge Case 4 (Boundary Value)
- **File:** `controllers/inventoryController.js:31`
- **Expected:** alert when `stock <= 5`
- **Actual:** `if (product.stock < 5)` — stock=5 does not trigger alert

---

## 4. Code Implementation Details

### Backend: Controller (`controllers/inventoryController.js`)

```javascript
exports.purchaseItem = (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stock < quantity)
    return res.status(400).json({ message: "Not enough stock available" });

  product.stock -= quantity;

  if (product.stock < 5) {  // Bug: should be <= 5
    console.log(`Low stock alert for ${product.name}. Current stock: ${product.stock}`);
  }

  stockHistory.push({ ... change: -quantity ... });
  res.json({ message: "Purchase successful", product });
};
```

### Backend: Routes (`routes/inventoryRoutes.js`)

```javascript
router.get("/",          inventoryController.getAllProducts);
router.post("/purchase", inventoryController.purchaseItem);
router.get("/low-stock", inventoryController.getLowStockItems);
router.get("/history",   inventoryController.getStockHistory);
// Missing: POST /restock
```

---

## 5. Test Script (`backend/tests/inventory.test.js`)

```javascript
const supertest = require('supertest');
let app;

beforeEach(() => {
  jest.resetModules();   // reset in-memory state
  app = require('../server');
});

test('Test 1: Successful Stock Deduction', async () => {
  const res = await supertest(app)
    .post('/api/inventory/purchase')
    .send({ productId: '1', quantity: 2 });
  expect(res.status).toBe(200);
  expect(res.body.product.stock).toBe(8);
  // ...
});

test('Edge Case 1: Race Condition', async () => {
  await supertest(app).post('/api/inventory/purchase').send({ productId: '1', quantity: 9 });
  const requests = Array(5).fill().map(() =>
    supertest(app).post('/api/inventory/purchase').send({ productId: '1', quantity: 1 })
  );
  const results = await Promise.all(requests);
  expect(results.filter(r => r.status === 200).length).toBe(1);
  expect(results.filter(r => r.status === 400).length).toBe(4);
});
```
