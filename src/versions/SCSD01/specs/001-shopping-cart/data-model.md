# Data Model: Shopping Cart Core Behaviors

**Date**: 2026-06-01  
**Spec**: specs/001-shopping-cart/spec.md  

## Entities

### Cart

Represents a shopper's cart.

Fields:
- `id`: unique identifier
- `shopper_id`: identifier for the shopper context (external to this feature)
- `created_at`, `updated_at`

Derived values:
- `grand_total`: sum of Active cart item line totals (money-safe arithmetic)

### CartItem

Represents a product line in a cart.

Fields:
- `id`: unique identifier
- `cart_id`: reference to Cart
- `sku`: product identifier
- `status`: `ACTIVE` or `SAVED`
- `quantity`: integer >= 0
- `unit_price_minor`: integer in minor units (e.g., cents)
- `line_total_minor`: integer in minor units (computed as `unit_price_minor * quantity`)
- `created_at`, `updated_at`

Constraints:
- For a given `(cart_id, sku)`, there MUST NOT be duplicate Active rows.
- `quantity` MUST NOT exceed available stock for the SKU when status is `ACTIVE`.

State transitions:
- `ACTIVE -> SAVED` via "Save for later"
- (Optional, future) `SAVED -> ACTIVE` via "Move to cart" (not required by current spec)

### InventoryItem

Represents current stock for a SKU.

Fields:
- `sku`: product identifier (primary key)
- `available_quantity`: integer >= 0
- `updated_at`

Invariant:
- Cart mutations must enforce: `current_active_cart_qty_for_sku + requested_additional_qty <= available_quantity`.

### MoneyAmount

Not necessarily a persisted table; a conceptual type used across layers.

Rules:
- Amounts are represented exactly (minor units) and formatted to two decimals for display.
- Totals computed for user-visible values MUST be exact for provided scenarios (e.g., 19.99 * 3 = 59.97).

## Relationships

- Cart 1..N CartItem
- InventoryItem keyed by SKU; CartItem references SKU for stock enforcement.

## Validation Rules (from spec)

- Reject any add/increase that would exceed stock; preserve previous cart state.
- Grand total includes only `ACTIVE` items.
- "Save for later" moves a line from ACTIVE list to SAVED list and updates totals.

