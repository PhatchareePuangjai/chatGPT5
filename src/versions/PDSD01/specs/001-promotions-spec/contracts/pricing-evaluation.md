# Contract: Promotion Evaluation

**Date**: 2026-04-03  
**Purpose**: Define the input and output contract for evaluating promotions and
coupons at checkout.

## Inputs

- **Cart**: `cart_id`, `customer_id`, `currency`, `items[]`, `subtotal`
- **Items[]**: `product_id`, `quantity`, `unit_price`, `line_total`
- **Coupon Code**: Optional string
- **Active Promotions**: Optional list of percentage promotions
- **Evaluation Time**: Current time used for expiration checks

## Outputs

- **Discount Line Items**: List of applied discounts with `type`, `source_id`,
  `amount`, `order`
- **Grand Total**: Final total after all discounts, clamped to >= 0
- **Messages**: User-visible message list (success or error)

## Validation Rules

- Minimum spend is checked before coupon application.
- Expired coupons are rejected with an explicit error message.
- Per-customer usage limits are enforced by querying usage history.
- Percentage promotions are applied before fixed-amount coupons.
- Final total must never be negative.

## Error Cases

- **Expired coupon**: Reject coupon and return "Coupon expired".
- **Usage limit reached**: Reject coupon and return "Usage limit reached".
- **Minimum spend not met**: Reject coupon and return an explanatory message.
