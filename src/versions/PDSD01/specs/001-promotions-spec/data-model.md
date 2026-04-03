# Data Model: Promotions and Discounts

**Date**: 2026-04-03  
**Feature**: [spec.md](/Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/PDSD01/specs/001-promotions-spec/spec.md)

## Entities

### Cart
- **Fields**: `id`, `customer_id`, `currency`, `subtotal`, `discount_total`,
  `grand_total`
- **Notes**: `grand_total` is computed; must never be negative.

### Cart Item
- **Fields**: `id`, `cart_id`, `product_id`, `quantity`, `unit_price`,
  `line_total`
- **Notes**: `line_total` = `quantity * unit_price` before discounts.

### Coupon
- **Fields**: `code`, `discount_type` (fixed), `discount_value`,
  `minimum_spend`, `expires_at`, `usage_limit_per_customer`
- **Validation**: `minimum_spend` and `discount_value` are non-negative.

### Promotion
- **Fields**: `id`, `type` (percentage), `percent`, `starts_at`, `ends_at`,
  `active`
- **Validation**: `percent` between 0 and 100.

### Discount Application
- **Fields**: `id`, `cart_id`, `source_type` (coupon/promotion),
  `source_id`, `amount`, `applied_order`
- **Notes**: `applied_order` enforces percentage before fixed discounts.

### Usage History
- **Fields**: `id`, `customer_id`, `coupon_code`, `order_id`, `used_at`
- **Validation**: Must be queryable by `customer_id` + `coupon_code`.

## Relationships

- Cart has many Cart Items.
- Cart has many Discount Applications.
- Coupon is referenced by Discount Application and Usage History.
- Promotion is referenced by Discount Application.

## State and Rules

- **Eligibility**: Coupon eligible only if `subtotal >= minimum_spend` and
  `expires_at` is after current time and usage count is below limit.
- **Ordering**: Percentage promotions applied before fixed coupons.
- **Safety**: `grand_total = max(0, subtotal - sum(discounts))`.
