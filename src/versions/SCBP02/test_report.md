# Shopping Cart System Test Report

**Date:** May 16, 2026
**Project Version:** shopping-cart-backend (SCBP02)

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using Jest.

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | ✅ PASS | Quantity updated to 3, Line Total and Grand Total correct. |
| **2) Merge Items Logic** | ✅ PASS | No duplicate rows, quantity merged correctly (1+2=3). |
| **3) Save for Later** | ✅ PASS | Item moved to savedForLater, removed from active cart totals. |
| **Edge 1) Add More Than Stock** | ❌ FAIL | No stock validation — system accepted qty=6 (got 200, expected 409). |
| **Edge 2) Floating Point Calculation** | ✅ PASS | 19.99 * 3 = 59.97 correct (JS floating point lucky result in this case). |

---

## 2. Test Output

```text
FAIL tests/scenarios.test.js
  Shopping Cart Scenarios
    ✓ Scenario 1: Update Item Quantity
    ✓ Scenario 2: Merge Items Logic
    ✓ Scenario 3: Save for Later
    ✕ Edge 1: Add More Than Stock
    ✓ Edge 2: Floating Point Calculation

Test Suites: 1 failed, 1 total
Tests:       1 failed, 4 passed, 5 total
Snapshots:   0 total
Time:        0.275 s
Ran all test suites.
```

---

## 3. Failure Analysis

### Edge 1: Add More Than Stock

SCBP02 ไม่มี stock validation ใดๆ ใน `addItem`:

```javascript
exports.addItem = (req, res) => {
  const { id, name, price, quantity } = req.body;
  const existingItem = cart.items.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += quantity; // ← รวมตรงๆ ไม่เช็ค stock
  } else {
    cart.items.push({ id, name, price, quantity });
  }

  res.json({ cart, totalPrice: calculateTotal() });
};
```

Logic ที่ขาดหายไป: `if ((existingQty + newQty) > stock) → reject 409`

---

## 4. Implementation Notes

SCBP02 ใช้ in-memory state (module-level variable) แทน database ทำให้:
- ไม่มีข้อมูล stock ใดๆ ในระบบ
- Merge logic ทำงานได้ถูกต้อง (basic)
- Save for Later ทำงานได้ถูกต้อง (basic)
- Floating point ผ่านได้เพราะ JS ให้ผลลัพธ์ที่ถูกต้องในกรณีนี้
