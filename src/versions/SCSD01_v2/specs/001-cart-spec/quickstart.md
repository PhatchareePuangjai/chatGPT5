# Quickstart: Shopping Cart Scenarios

**Feature**: /Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/SCSD01-v2/specs/001-cart-spec/spec.md
**Date**: 2026-04-05

## Goal

Demonstrate the cart behaviors: quantity updates, duplicate item merge, save for
later, stock validation, and precise totals.

## Example Flow (Pseudo-Usage)

1. Create a cart with currency THB.
2. Add item SKU-001 at 100.00 THB with quantity 1.
3. Add SKU-001 again with quantity 2.
   - Expect merged quantity = 3 and updated totals.
4. Update SKU-001 quantity from 3 to 1.
   - Expect line total and grand total to decrease.
5. Add SKU-005 and choose "Save for Later".
   - Expect SKU-005 removed from active list and totals updated.
6. Attempt to add beyond stock.
   - Expect an "insufficient stock" error and unchanged cart.

## Validation Checklist

- Totals are accurate to two decimals (no floating artifacts).
- Saved items are excluded from active cart totals.
- Duplicate SKUs do not create extra rows.
- Stock validation prevents over-allocation.

## Validation Steps

1. Run the example flow and confirm each expectation step matches the cart state.
2. Verify totals after each operation match the manual calculation.
3. Trigger stock overflow and confirm the cart state is unchanged.

## UX Consistency Review

- Error messages use the same terminology as the product catalog (e.g., \"insufficient stock\").
- Cart and product views use the same currency formatting.
- Saved items labels match existing UI naming conventions.

## Running Tests

- `pytest` (unit + integration)
