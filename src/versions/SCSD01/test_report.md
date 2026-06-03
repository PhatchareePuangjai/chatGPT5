# Shopping Cart System Test Report

**Date:** June 1, 2026
**Project Version:** SCSD01 (TypeScript - Shopping Cart Backend)

## 1. Test Summary

Scenarios defined in `scenarios_cart.md` were tested using Vitest.

### Scenario Tests

| Scenario | Test File | Result | Notes |
|---|---|---|---|
| Update Item Quantity | `tests/integration/cart.updateQuantity.test.ts` | PASS | Recalculates line total and grand total |
| Merge Items Logic | `tests/integration/cart.addItemMerge.test.ts` | PASS | Enforces stock limits and preserves state on rejection |
| Save for Later | `tests/integration/cart.saveForLater.test.ts` | PASS | Removes item from active totals and places it in saved list |
| Edge 1: Add More Than Stock | `tests/integration/cart.addItemMerge.test.ts` | PASS | Rejects cumulative quantity above stock and preserves the existing cart quantity |
| Edge 2: Floating Point | `tests/unit/money.test.ts` | PASS | 19.99 × 3 = 59.97 verified via minor-unit integer arithmetic |

**Scenario Total: 5 passed, 0 failed, 5 total**

> **Note — Scenario coverage combined in one test file:**
> `tests/integration/cart.addItemMerge.test.ts` covers both Merge Items Logic and Edge 1) Add More Than Stock. These are counted as two scenario outcomes because both requirements are explicitly verified.

> **Note — Additional tests (not counted in scenario total):**
> The following tests verify API response shape and an extra money precision case; they do not correspond to a scenario in `scenarios_cart.md`.
>
> | Test File | Result | Notes |
> |---|---|---|
> | `tests/unit/money.test.ts` (100.00 × 3 = 300.00) | PASS | Extra precision case beyond Edge 2 |
> | `tests/contract/cart.addItemMerge.test.ts` | PASS | API response shape |
> | `tests/contract/cart.saveForLater.test.ts` | PASS | API response shape |
> | `tests/contract/cart.updateQuantity.test.ts` | PASS | API response shape |

---

## 2. Test Output

```text
$ npm test

 RUN  v2.1.9 src/versions/SCSD01/backend

 ✓ tests/contract/cart.updateQuantity.test.ts (1 test) 1ms
 ✓ tests/integration/cart.updateQuantity.test.ts (1 test) 1ms
 ✓ tests/contract/cart.saveForLater.test.ts (1 test) 1ms
 ✓ tests/contract/cart.addItemMerge.test.ts (1 test) 1ms
 ✓ tests/integration/cart.saveForLater.test.ts (1 test) 1ms
 ✓ tests/integration/cart.addItemMerge.test.ts (1 test) 1ms
 ✓ tests/unit/money.test.ts (2 tests) 1ms

 Test Files  7 passed (7)
      Tests  8 passed (8)
```

---

## 3. Code Implementation Details

- Test runner: Vitest
- Backend path: `src/versions/SCSD01/backend`
- Relevant modules:
  - `src/lib/money.ts` — minor-unit arithmetic (verified by unit tests)
  - `src/api/` — cart endpoints (contract and integration tests)
