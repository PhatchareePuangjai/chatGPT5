# Shopping Cart System Test Report

**Date:** May 17, 2026
**Project Version:** SCCE02

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using Node.js built-in `node:test`.

Evaluation is based on the full user-action workflow required by each scenario. A scenario is counted as PASS only when the backend exposes the required API action and implements the expected business behavior.

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | ❌ FAIL | `PATCH /api/cart/items/:sku` returns 404. Backend only exposes `GET /api/cart/:userId`. |
| **2) Merge Items Logic** | ❌ FAIL | `POST /api/cart/items` returns 404, so duplicate-SKU merge cannot be performed. |
| **3) Save for Later** | ❌ FAIL | The save-for-later endpoint returns 404. `getCart` does exclude `SAVED` rows from the active total, but the user action itself is missing. |
| **Edge 1) Add More Than Stock** | ❌ FAIL | No add/update endpoint (404) and no stock validation logic. |
| **Edge 2) Floating Point Calculation** | ✅ PASS | With rows seeded directly, `getCart` computes `1999 × 3 = 5997` cents exactly. Integer-cent arithmetic is correct. |

**Overall Result: 1 passed, 4 failed.**

> **Re-graded 2026-08-09.** The earlier report recorded 0/5. That suite injected a fake `db` module into `require.cache`, so the application's SQL never ran, and two scenarios were asserted with regular expressions over the source text of the route and controller files (for example `assert.match(routesSource, /router\.(patch|put)\(/)`), which passes whenever a matching string exists regardless of behaviour. The suite now runs against a real PostgreSQL instance inside the compose network — `db.js` hardcodes host `db`, so the tests execute there rather than modifying application code. Edge 2 turns out to pass: the money arithmetic is correct, and only the missing endpoints fail. The schema used by the suite is derived from the JOIN in `controllers/cartController.js`, because the generated project ships no schema file even though its prompt listed "the database schema" as a deliverable.

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
