# Contract: Cart UI (Shopping Cart Core Behaviors)

**Date**: 2026-06-01  
**Spec**: specs/001-shopping-cart/spec.md  

This contract describes user-facing UI behaviors required by the spec scenarios.

## Views

### Active Cart ("ตะกร้าที่ต้องชำระเงิน")

Displays ACTIVE cart items.

For each item:
- SKU / product identifier
- Quantity control (increase/decrease and/or direct set)
- Unit price
- Line total
- Action: "Save for later"

Also displays:
- Grand total for ACTIVE items (updates immediately after any mutation)

### Saved Items ("Saved Items")

Displays SAVED items separately from the checkout list.

## UX Requirements

- Totals update immediately after:
  - quantity changes
  - add-to-cart merges
  - save-for-later
- When a stock limit is exceeded:
  - show a clear error: "สินค้าไม่เพียงพอ"
  - keep the prior quantity and totals (no transient overstock state)
- Monetary formatting:
  - display values with exactly 2 decimals
  - never display floating-point artifacts

## Accessibility Requirements

- Quantity controls are keyboard operable
- Focus is managed so users can complete cart updates without a mouse
- Error message is announced to assistive technologies when applicable

