# Quickstart: Shopping Cart Core Behaviors

**Date**: 2026-05-24
**Feature**: specs/001-shopping-cart/spec.md

This quickstart describes how to validate the feature once the application scaffolding exists.
It is intentionally light on implementation details.

## What "Done" Means

The feature is considered complete when all acceptance scenarios and edge cases in `spec.md` are
covered by automated tests and pass in CI, including:

- Quantity update recalculates line totals and grand total immediately and correctly.
- Add-to-cart merges duplicate SKUs into a single active cart line.
- Save-for-later removes an item from active items, adds it to saved items, and updates totals.
- Stock checks reject updates that exceed stock and keep the cart unchanged.
- Money calculations display correct 2-decimal results with no float artifacts.

## Manual Validation (High-Level)

1. Start the application (frontend + backend) and open the cart UI.
2. Add SKU-001 with quantity 1, then add it again with quantity 2:
   - Verify there is only one line for SKU-001 with quantity 3.
3. Update quantity of a cart item and confirm line total and grand total update immediately.
4. Attempt to exceed stock:
   - With stock=5 and current cart qty=3, attempt to add 3 more.
   - Verify the UI shows "insufficient stock" and quantity remains 3.
5. Save an item for later:
   - Verify it moves to saved items and is excluded from totals.

## Automated Validation Expectations

- Unit tests validate cart math (money, line totals, grand totals) deterministically.
- Integration tests validate the end-to-end flow for:
  - add/merge
  - update quantity (including stock failure)
  - save for later

## Verification Notes

- 2026-05-24: Backend and frontend automated test suites executed successfully (`backend npm test`, `frontend npm test`).
