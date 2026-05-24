# Shopping Cart System Test Report

**Date:** May 24, 2026
**Project Version:** SCSD02 (TypeScript — Express API + React UI)

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using Vitest.

### Backend Integration Tests

| Test | Result | Notes |
|---|---|---|
| `cartService.setItemQty` | ✅ PASS | Updates quantity to 3 and recalculates line/grand total to `300.00`. |
| `cartService.addItem` | ✅ PASS | Adds same SKU twice and merges into one active row with qty=3. |
| `cartService.saveForLater` | ✅ PASS | Moves active item to saved list and excludes it from grand total. |
| `cartService.addItem stock enforcement` | ✅ PASS | Rejects cumulative qty above stock with `Insufficient stock`; cart remains unchanged. |
| `cartService.getCart` | ✅ PASS | Returns required cart contract fields. |

### Backend Unit Tests

| Test | Result | Notes |
|---|---|---|
| `money parses and formats minor units deterministically` | ✅ PASS | `19.99` converts to `1999`; formatting returns `19.99`. |
| `money multiplies using integers` | ✅ PASS | `19.99 * 3 = 5997` minor units / `59.97`. |
| `cartTotals recomputes line totals and grand total` | ✅ PASS | Qty=3 at `100.00` totals to `30000` minor units. |

### Frontend Tests

| Test | Result | Notes |
|---|---|---|
| `Cart totals UI (US1)` | ✅ PASS | Quantity update refreshes displayed grand total from `100.00` to `300.00`. |
| `Save for later UI (US3)` | ✅ PASS | Save action moves item to saved list and updates total to `0.00`. |

**Total: 10 passed, 0 failed**

---

## 2. Test Output

```text
$ npm test  # backend

> test
> vitest run

RUN  v4.1.7 /Users/phatchareepuangjai/Documents/learn/chatGPT5/src/versions/SCSD02/backend

Test Files  7 passed (7)
Tests       8 passed (8)
Start at    14:13:43
Duration    328ms
```

```text
$ npm test  # frontend

> test
> vitest run

RUN  v4.1.7 /Users/phatchareepuangjai/Documents/learn/chatGPT5/src/versions/SCSD02/frontend

Test Files  2 passed (2)
Tests       2 passed (2)
Start at    14:13:43
Duration    740ms
```

---

## 3. Code Implementation Details

### Backend API Routes

Implemented cart endpoints:

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:sku`
- `POST /cart/items/:sku/save`

### CartService

`CartService` coordinates repository access, stock checks, merge behavior, quantity updates, save-for-later behavior, and response formatting.

### Money Precision

Money is stored and calculated in integer minor units. This avoids floating-point precision problems such as `19.99 * 3`.

### Cart Totals

`computeCartTotals()` recomputes line totals and grand total from active cart items only.

### Frontend State

`CartProvider` accepts an injected `CartApi`, allowing UI behavior to be tested without a live backend.

---

## 4. Scenario Coverage

| Scenario | Covered By | Result |
|---|---|---|
| Update Item Quantity | Backend integration + frontend UI test | ✅ PASS |
| Merge Items Logic | Backend integration test | ✅ PASS |
| Save for Later | Backend integration + frontend UI test | ✅ PASS |
| Add More Than Stock | Backend integration test | ✅ PASS |
| Floating Point Calculation | Backend money unit test | ✅ PASS |
