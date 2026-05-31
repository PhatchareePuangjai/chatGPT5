# Contracts: HTTP API (Pricing / Promotions)

**Date**: 2026-05-31
**Spec**: `specs/001-promotions-discounts/spec.md`

This document defines a minimal HTTP contract for pricing preview and coupon application.
Paths are illustrative; choose actual paths during implementation but preserve response shape.

## Common Types

### Money

- `currency`: string (e.g., `"THB"`)
- `amount`: integer (smallest currency unit) OR decimal string

Note: pick one representation and keep it consistent end-to-end.

### Pricing Breakdown

- `subtotal`
- `discount_lines[]` (ordered)
  - `kind`: `"coupon" | "promotion"`
  - `label`: string
  - `amount` (positive reduction)
- `grand_total`

## Endpoints

### GET /api/carts/{cartId}/pricing

Returns the current pricing breakdown for a cart, including any currently applied coupon and automatic
promotions.

**Response 200**
```json
{
  "cartId": "c_123",
  "pricing": {
    "subtotal": { "currency": "THB", "amount": 200000 },
    "discount_lines": [
      { "kind": "promotion", "label": "10% cart discount", "amount": { "currency": "THB", "amount": 20000 } },
      { "kind": "coupon", "label": "SAVE100", "amount": { "currency": "THB", "amount": 10000 } }
    ],
    "grand_total": { "currency": "THB", "amount": 170000 }
  }
}
```

### POST /api/carts/{cartId}/coupon

Attempts to apply a coupon code to a cart.

**Request**
```json
{ "code": "SAVE100" }
```

**Response 200 (applied)**
```json
{
  "status": "applied",
  "message": "ใช้คูปองสำเร็จ",
  "pricing": { "subtotal": { "currency": "THB", "amount": 100000 }, "discount_lines": [], "grand_total": { "currency": "THB", "amount": 90000 } }
}
```

**Response 400 (rejected)**
```json
{
  "status": "rejected",
  "code": "COUPON_EXPIRED",
  "message": "คูปองหมดอายุ",
  "pricing_unchanged": true
}
```

Possible `code` values:
- `COUPON_INVALID`
- `COUPON_EXPIRED`
- `COUPON_MIN_SPEND_NOT_MET`
- `COUPON_USAGE_LIMIT_REACHED` (message: "คุณใช้สิทธิ์ครบแล้ว")

### DELETE /api/carts/{cartId}/coupon

Removes an applied coupon from the cart.

**Response 200**
```json
{ "status": "removed", "pricing": { "subtotal": { "currency": "THB", "amount": 100000 }, "discount_lines": [], "grand_total": { "currency": "THB", "amount": 100000 } } }
```

## Rules (Contract-Level)

- Coupon rejections must not change the cart total.
- Discount lines must be ordered per stacking order rules.
- Grand total must never be negative.

