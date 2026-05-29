# Contracts: Promotions HTTP API

**Feature**: `specs/001-promotions-discounts/spec.md`  
**Date**: 2026-05-29

This document defines user-facing API contracts for applying coupons and calculating checkout totals.
Exact routing/names can change, but request/response shapes and semantics MUST remain consistent.

## POST /checkout/apply-coupon

Applies a coupon code to the current checkout/cart context and returns recalculated totals plus discount
line items.

### Request

```json
{
  "cartId": "string",
  "couponCode": "string"
}
```

### Success Response (200)

```json
{
  "coupon": {
    "code": "SAVE100",
    "status": "APPLIED"
  },
  "totals": {
    "currency": "THB",
    "subtotalSatang": 100000,
    "discountTotalSatang": 10000,
    "grandTotalSatang": 90000
  },
  "discountLines": [
    {
      "type": "PROMOTION",
      "label": "10% off",
      "amountSatang": 0,
      "order": 1
    },
    {
      "type": "COUPON",
      "label": "Coupon SAVE100",
      "amountSatang": 10000,
      "order": 2
    }
  ],
  "message": "ใช้คูปองสำเร็จ"
}
```

### Error Responses

- 400 `INVALID_COUPON` (unknown/malformed)
- 409 `COUPON_EXPIRED`
- 409 `COUPON_MIN_SPEND_NOT_MET`
- 409 `COUPON_USAGE_LIMIT_REACHED`

All error responses MUST:
- Keep totals unchanged from the server’s last known state for that cart
- Return a user-facing `message` suitable for display

## GET /checkout/totals

Returns current totals and discount lines for a cart.

### Response (200)

```json
{
  "totals": {
    "currency": "THB",
    "subtotalSatang": 200000,
    "discountTotalSatang": 20000,
    "grandTotalSatang": 180000
  },
  "discountLines": [
    {
      "type": "PROMOTION",
      "label": "10% off",
      "amountSatang": 20000,
      "order": 1
    }
  ]
}
```

## Invariants

- `grandTotalSatang` MUST be `>= 0`.
- Discount application order is deterministic:
  1) cart-level percent promotions
  2) fixed-amount discounts (coupon)
  3) clamp to zero

