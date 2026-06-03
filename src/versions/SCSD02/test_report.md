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

### Backend Unit Tests

| Test | Result | Notes |
|---|---|---|
| `money multiplies using integers` | ✅ PASS | `19.99 * 3 = 5997` minor units / `59.97`. |

**Total: 5 passed, 0 failed, 5 total**

> **Note — Additional tests (not counted in scenario total):**
> The following tests verify internal utility behaviour and UI rendering; they do not correspond directly to a scenario in `scenarios_cart.md`.
>
> | Test | Result | Notes |
> |---|---|---|
> | `cartService.getCart` | ✅ PASS | API response shape |
> | `money parses and formats minor units deterministically` | ✅ PASS | Internal money formatting utility |
> | `cartTotals recomputes line totals and grand total` | ✅ PASS | Internal totals utility |
> | `Cart totals UI (US1)` | ✅ PASS | Frontend rendering (Scenario 1 covered by integration) |
> | `Save for later UI (US3)` | ✅ PASS | Frontend rendering (Scenario 3 covered by integration) |

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
