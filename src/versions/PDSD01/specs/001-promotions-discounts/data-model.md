# Data Model: Promotions & Discounts

**Date**: 2026-05-31
**Spec**: `specs/001-promotions-discounts/spec.md`

This describes the domain entities and persistence needs to support:
- coupon validation (min spend, expiration, value)
- per-user usage limits via redemption history
- deterministic discount stacking order
- transparent pricing breakdown

## Entities

### Coupon

Represents a redeemable code with eligibility rules.

Fields (conceptual):
- `code` (unique, case-normalized)
- `status` (active/disabled)
- `valid_from`, `valid_until` (store timezone semantics)
- `min_spend_amount`
- `discount_type` (fixed_amount or percent)
- `discount_value`
- `per_user_limit` (e.g., 1)

### Promotion

Represents an automatic discount rule (e.g., 10% off cart total).

Fields (conceptual):
- `status` (active/disabled)
- `valid_from`, `valid_until`
- `promotion_type` (cart_total_percent, etc.)
- `value` (e.g., 10 for 10%)
- `eligibility_rules` (e.g., min cart total)

### Coupon Redemption History

Records that a user has successfully redeemed a coupon.

Fields (conceptual):
- `user_id`
- `coupon_code` (or `coupon_id`)
- `order_id`
- `redeemed_at`

Constraints:
- Enforce per-user limits by querying count by `(user_id, coupon)` (and/or using a uniqueness
  constraint for the 1-use-per-user case).

### Cart / Checkout Price Preview

Represents the in-progress cart being priced.

Fields (conceptual):
- `cart_id`
- `user_id` (or anonymous identifier if supported)
- `items[]` (product id, quantity, unit price)

### Order

Represents a completed purchase and is the authoritative source for redemption history.

Fields (conceptual):
- `order_id`
- `user_id`
- `subtotal_amount`
- `discount_total_amount`
- `grand_total_amount` (non-negative)
- `created_at`, `completed_at`

### Discount Application (Order Discount Breakdown)

Captures the set of discounts applied and their ordering, so totals can be explained and audited.

Fields (conceptual):
- `order_id`
- `sequence` (applied order)
- `kind` (coupon or promotion)
- `reference` (coupon code / promotion id)
- `amount` (positive number representing a reduction)

## Invariants

- Grand total must be `>= 0`.
- Pricing calculation order is deterministic and recorded in discount breakdown.
- Coupon usage limits are enforced before approval, using stored redemption history.

