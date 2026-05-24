# Data Model: Shopping Cart Core Behaviors

**Date**: 2026-05-24
**Feature**: specs/001-shopping-cart/spec.md

This document defines the logical entities, fields, and rules needed to implement the cart behaviors
in the specification. Field types are illustrative; exact SQL types are an implementation detail.

## Entities

### Product

Represents a purchasable item.

- `sku` (identifier)
- `unit_price_minor` (money in minor units, e.g., cents)
- `active` (optional)

### Inventory (Stock)

Represents available stock for a product.

- `sku` (references Product)
- `available_qty`
- `updated_at`

Rule:

- Stock validation for cart operations uses: `(current_cart_qty + requested_qty_change) <= available_qty`.

### Cart

Represents a user's cart.

- `cart_id` (identifier)
- `owner_key` (user id or session id)
- `created_at`
- `updated_at`

### CartItem (Active)

Represents a line item in the active cart (checkout set).

- `cart_id` (references Cart)
- `sku` (references Product)
- `qty`
- `unit_price_minor` (copied/locked for calculation consistency)
- `line_total_minor` (derived: `qty * unit_price_minor`)
- `added_at`
- `updated_at`

Constraints:

- One active cart line per `(cart_id, sku)` (supports "no duplicate rows").
- `qty` MUST be positive.
- `line_total_minor` MUST equal `qty * unit_price_minor`.

### SavedItem

Represents an item moved out of the active cart and into a "saved for later" list.

- `cart_id` (references Cart)
- `sku` (references Product)
- `saved_at`

Constraints:

- Saved items are excluded from cart grand totals.
- A cart may have both an active cart item and a saved item for the same SKU only if explicitly
  allowed; default assumption for this feature: prevent duplicates and treat save as a move from
  active to saved.

## Derived Values

### Line Total

- `line_total_minor = qty * unit_price_minor`

### Grand Total

- `grand_total_minor = sum(line_total_minor for all active CartItem rows in the cart)`

## State Transitions

- Add to cart:
  - If `(cart_id, sku)` exists in CartItem: merge by increasing `qty` and recomputing totals.
  - Else: create a new CartItem row.
- Update quantity:
  - Set CartItem `qty` to requested value and recompute totals.
  - Reject if requested `qty` violates stock.
- Save for later:
  - Remove CartItem row for `(cart_id, sku)` and create SavedItem row.
  - Grand total decreases by that line total.
