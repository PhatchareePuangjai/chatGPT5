# Contracts: Shopping Cart HTTP API

**Date**: 2026-05-24
**Feature**: specs/001-shopping-cart/spec.md

This document specifies a minimal HTTP contract to support the cart behaviors in the spec.
Authentication/session details are out of scope; endpoints assume an established cart identity.

## Conventions

- Monetary values are returned as both:
  - `*_minor`: integer in minor units (e.g., cents)
  - `*_display`: string formatted to 2 decimals for UI display
- A cart has two collections: `active_items` and `saved_items`.
- Errors use a stable machine-readable code plus a human message.

## Data Shapes

### Cart (response)

```json
{
  "cart_id": "string",
  "currency": "string",
  "active_items": [
    {
      "sku": "string",
      "unit_price_minor": 1999,
      "unit_price_display": "19.99",
      "qty": 3,
      "line_total_minor": 5997,
      "line_total_display": "59.97"
    }
  ],
  "saved_items": [
    {
      "sku": "string"
    }
  ],
  "grand_total_minor": 5997,
  "grand_total_display": "59.97"
}
```

### Error (response)

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock"
  }
}
```

## Endpoints

### GET /cart

Fetch the current cart (active + saved) and totals.

Response: `200` with `Cart`.

### POST /cart/items

Add a product to the cart. If the SKU already exists in active items, merge quantities (no new row).

Request:

```json
{
  "sku": "SKU-001",
  "qty": 2
}
```

Responses:

- `200` with `Cart` (merged or newly added)
- `409` with `Error` code `INSUFFICIENT_STOCK` (cart unchanged)

### PATCH /cart/items/{sku}

Set the quantity for an existing active cart item.

Request:

```json
{
  "qty": 3
}
```

Responses:

- `200` with `Cart`
- `404` if the item is not an active cart item
- `409` with `Error` code `INSUFFICIENT_STOCK` (cart unchanged)

### POST /cart/items/{sku}/save

Move an active item into saved-for-later.

Responses:

- `200` with `Cart` (item removed from active, present in saved, totals updated)
- `404` if the item is not an active cart item
