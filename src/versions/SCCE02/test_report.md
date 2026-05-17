# Shopping Cart System Test Report

**Date:** May 17, 2026
**Project Version:** SCCE02

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using Node.js built-in `node:test`.

Evaluation is based on the full user-action workflow required by each scenario. A scenario is counted as PASS only when the backend exposes the required API action and implements the expected business behavior.

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | FAIL | No update quantity endpoint exists. Backend only exposes `GET /api/cart/:userId`. |
| **2) Merge Items Logic** | FAIL | No add-to-cart endpoint exists, so duplicate SKU merge behavior cannot be performed. |
| **3) Save for Later** | FAIL | No save-for-later endpoint exists. `getCart` can exclude `SAVED` items from active total, but the user action itself is not implemented. |
| **Edge 1) Add More Than Stock** | FAIL | No add/update endpoint exists and no stock validation logic is implemented. |
| **Edge 2) Floating Point Calculation** | FAIL | Integer-cent calculation exists inside `getCart`, but the required user workflow of adding `19.99` item quantity `3` cannot be performed because add-to-cart is missing. |

**Overall Result:** 0 passed, 5 failed.

---

## 2. Test Output

```text
$ node --test tests/scenarios.test.js

✔ Route mapping: exposes GET /api/cart/:userId through cartRoutes
✔ Scenario 1: update quantity to 3 should produce quantity 3 and 30000 cents line total
✖ Scenario 1 expected failure: backend should implement an update quantity endpoint
✖ Scenario 2 expected failure: backend should implement add-to-cart merge logic
✔ Scenario 3: saved items should be excluded from active total but still returned
✖ Scenario 3 expected failure: backend should implement save-for-later endpoint
✖ Edge Case 1 expected failure: backend should reject current cart quantity plus new quantity beyond stock
✔ Edge Case 2: floating point calculation should remain exact using integer cents

tests 8
pass 4
fail 4
duration_ms 64.5405
```

The passing checks above verify isolated internal behavior only. They do not count as scenario PASS because the required user-action endpoints are missing.

---

## 3. Code Implementation Details

### Backend: Routes (`backend/routes/cartRoutes.js`)

```javascript
router.get('/:userId', controller.getCart);
```

The backend exposes only one cart endpoint:

```text
GET /api/cart/:userId
```

Missing API actions required by `scenarios_cart.md`:

```text
POST /api/cart/items
PATCH or PUT /api/cart/items/:id
POST or PUT /api/cart/items/:id/save
```

### Backend: Cart Retrieval (`backend/controllers/cartController.js`)

```javascript
const items = result.rows.map(item => {
  const lineTotal = item.price_cents * item.quantity;
  if (item.status === "ACTIVE") totalCents += lineTotal;
  return { ...item, lineTotal };
});
```

Implemented behavior:

- Calculates `lineTotal` using integer cents
- Adds only `ACTIVE` items to `totalCents`
- Returns `SAVED` items in the response

Not implemented:

- update quantity
- add-to-cart
- merge duplicate items
- save-for-later action
- stock validation

## 4. Test Script (`backend/tests/scenarios.test.js`)

The Node.js test file verifies the implemented `getCart` behavior and explicitly records expected failures for missing scenario workflow endpoints.

```text
src/versions/SCCE02/backend/tests/scenarios.test.js
```
