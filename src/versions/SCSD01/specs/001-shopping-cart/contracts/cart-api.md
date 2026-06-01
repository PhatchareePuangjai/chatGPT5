# Contract: Cart API (Shopping Cart Core Behaviors)

**Date**: 2026-06-01  
**Spec**: specs/001-shopping-cart/spec.md  

This contract describes the external behavior of cart operations needed to satisfy the
spec scenarios. It intentionally avoids implementation details.

## Concepts

- A cart has line items with: `sku`, `status` (`ACTIVE`/`SAVED`), `quantity`, `unit_price`, `line_total`
- Grand total is the sum of line totals for ACTIVE items only
- Mutations are atomic: rejected mutations do not partially apply

## Read

### Get Cart

Request: `GET /cart`

Response (example shape):
- `items_active`: list of active cart items
- `items_saved`: list of saved items
- `grand_total`: total for active items

## Mutations

### Add To Cart (Merge Duplicate)

Request: `POST /cart/items`

Inputs:
- `sku`
- `quantity` (positive integer)

Behavior:
- If an ACTIVE line for `sku` already exists, the quantities merge into that line.
- No duplicate ACTIVE rows for the same SKU are created.
- Stock enforcement: if the merged quantity would exceed stock, reject the mutation.

Errors:
- `INSUFFICIENT_STOCK`: cart remains unchanged; user-friendly message: "สินค้าไม่เพียงพอ"

### Update Item Quantity

Request: `PATCH /cart/items/{sku}`

Inputs:
- `quantity` (integer >= 0)

Behavior:
- Updates quantity for the ACTIVE cart line of `sku`.
- Recomputes line total and grand total immediately.
- If the new quantity exceeds stock, reject the mutation and preserve previous state.

Errors:
- `INSUFFICIENT_STOCK`: cart remains unchanged; user-friendly message: "สินค้าไม่เพียงพอ"
- `NOT_FOUND`: no active cart line exists for `sku`

### Save For Later

Request: `POST /cart/items/{sku}/save`

Behavior:
- Moves the ACTIVE cart line for `sku` to SAVED status.
- The item no longer contributes to grand total.

Errors:
- `NOT_FOUND`: no active cart line exists for `sku`

## Money Precision Rules

- Monetary values exposed to clients are exact to two decimal places for display.
- No floating-point artifacts may be visible in API responses for totals.

