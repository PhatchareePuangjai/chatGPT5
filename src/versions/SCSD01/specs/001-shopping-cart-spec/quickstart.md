# Quickstart: Shopping Cart Module + UI

**Date**: 2026-04-03

## Goal

Validate the shopping cart behaviors: quantity updates, duplicate merges, stock
limits, save-for-later, and precise totals, using both the core module and the
front-end UI.

## Example Flow (Conceptual)

1. Create a cart with SKU-001 priced at 100 and quantity 1.
2. Update quantity to 3 and confirm:
   - Quantity is 3
   - Line total is 300
   - Cart total updates immediately
3. Add SKU-001 with quantity 2 again and confirm:
   - No duplicate row
   - Quantity becomes 3 (1 + 2)
4. Attempt to add beyond stock and confirm:
   - Action rejected
   - Warning message shown
   - Quantity remains unchanged
5. Move SKU-005 to “Saved for Later” and confirm:
   - Item removed from active cart
   - Cart total reduced
   - Item appears in saved list
6. Validate decimal pricing:
   - 19.99 * 3 displays 59.97

## UI Validation Steps

1. Load the cart UI and add SKU-001 with quantity 1.
2. Use the quantity controls to set quantity to 3 and verify totals.
3. Add SKU-001 again with quantity 2 and verify merge behavior.
4. Try to exceed stock and verify the warning message.
5. Use “Save for Later” to move SKU-005 and verify it appears in saved items.

## Expected Outputs

- Correct line totals and cart totals after each change
- Consistent warning text for stock violations
- Saved items excluded from active totals
