# Data Model: Promotions and Discounts

**Feature**: `specs/001-promotions-discounts/spec.md`  
**Date**: 2026-05-29

## Core Entities

### Coupon

Represents a code-based discount with constraints.

Suggested fields:
- `id` (PK)
- `code` (unique, normalized)
- `discount_type` (`FIXED_AMOUNT`)
- `amount_satang` (integer, >= 0)
- `min_spend_satang` (integer, >= 0)
- `starts_at` (timestamp, nullable)
- `expires_at` (timestamp, nullable)
- `usage_limit_per_user` (integer, nullable; `1` for one-time)
- `is_active` (boolean)

Constraints:
- `code` unique
- `amount_satang` >= 0, `min_spend_satang` >= 0

### CouponRedemption

Tracks per-user coupon usage.

Suggested fields:
- `id` (PK)
- `coupon_id` (FK -> Coupon)
- `user_id` (FK -> User)
- `order_id` (FK -> Order, nullable until checkout completes)
- `redeemed_at` (timestamp)

Constraints:
- For one-time coupons: unique (`coupon_id`, `user_id`)

### Promotion

Represents cart-level promotions (e.g., 10% off cart).

Suggested fields:
- `id` (PK)
- `name`
- `promotion_type` (`CART_PERCENT`)
- `percent_basis_points` (integer, 0..10000)
- `starts_at` / `expires_at` (nullable)
- `is_active` (boolean)

Constraints:
- `percent_basis_points` between 0 and 10000 inclusive

### Cart / CartItem (conceptual)

Cart can be persisted or computed; the promotions system consumes a cart snapshot:
- Cart: `user_id`, `subtotal_satang`, `currency`
- Items: `product_id`, `quantity`, `unit_price_satang`, `line_total_satang`

### Order

Persisted purchase used for auditing and coupon usage history.

Suggested fields:
- `id` (PK)
- `user_id` (FK)
- `subtotal_satang`
- `discount_total_satang`
- `grand_total_satang` (>= 0)
- `created_at`

### OrderDiscountLine

Stores applied discounts as line items (also returned to UI).

Suggested fields:
- `id` (PK)
- `order_id` (FK)
- `source_type` (`COUPON` | `PROMOTION`)
- `source_id` (coupon_id or promotion_id)
- `label`
- `amount_satang` (integer, >= 0)
- `applied_order` (integer; calculation order index)

Constraints:
- `amount_satang` >= 0

## Relationships

- Coupon 1..N CouponRedemption
- User 1..N CouponRedemption
- Order 1..N OrderDiscountLine

## Business Rules (data enforced)

- Coupon codes must be unique and normalized (case-insensitive behavior should be standardized).
- One-time-per-user coupons must be enforced with a unique constraint to prevent race conditions.
- Totals must never be negative; store `grand_total_satang` with a CHECK constraint `>= 0`.

