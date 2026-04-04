# Data Model: Shopping Cart

**Date**: 2026-04-03

## Entities

### Cart
- **Fields**: id, items (list of Cart Item), totals (Money)
- **Relationships**: Contains many Cart Items
- **Rules**:
  - Totals include only items with status `ACTIVE`.
  - Totals are recalculated on any item quantity or status change.

### Cart Item
- **Fields**: sku, unit_price (Money), quantity, line_total (Money), status
  (`ACTIVE` or `SAVED`)
- **Rules**:
  - `quantity` must be a positive integer.
  - `line_total = unit_price * quantity` using integer cents arithmetic.
  - If `status` is `SAVED`, the item is excluded from cart totals.

### Inventory Snapshot
- **Fields**: sku, available_quantity
- **Rules**:
  - Stock validation uses `current_cart_qty + requested_qty <= available_quantity`.

## State Transitions

### Cart Item Status
- `ACTIVE` -> `SAVED`: occurs when user selects “Save for Later”; item removed from
  active totals.
- `SAVED` -> `ACTIVE`: optional future behavior (not in current scope).

## Validation Rules

- Reject quantity updates that would exceed stock.
- Keep previous quantity and show a stock warning on rejection.
- Decimal prices must display correct two-decimal results without artifacts.
