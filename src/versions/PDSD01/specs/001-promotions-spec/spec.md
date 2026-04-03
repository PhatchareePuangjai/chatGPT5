# Feature Specification: Promotions and Discounts

**Feature Branch**: `001-promotions-spec`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "Create a specification based on the requirements in scenarios_promotions.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apply Valid Coupon (Priority: P1)

As a shopper, I want to apply a valid coupon that meets minimum spend so I can
see the correct discount on my cart total.

**Why this priority**: This is the primary value of the promotion system and
directly impacts checkout conversion.

**Independent Test**: Can be fully tested by applying a known coupon to a cart
and verifying the total and success message.

**Acceptance Scenarios**:

1. **Given** a cart total of 1,000 THB and coupon "SAVE100" with a minimum spend
   of 500 THB, **When** the user applies "SAVE100", **Then** the system approves
   the coupon, reduces the total by 100 THB (to 900 THB), and shows "Coupon
   applied successfully".

---

### User Story 2 - Cart Total Percentage Discount (Priority: P2)

As a shopper, I want cart-level percentage promotions to be calculated correctly
so I can trust the displayed total.

**Why this priority**: Percentage promos are common and must be accurate and
transparent to prevent disputes.

**Independent Test**: Can be fully tested by applying a percentage promo and
verifying the discount line and grand total.

**Acceptance Scenarios**:

1. **Given** a cart total of 2,000 THB and a 10% cart-level promotion, **When**
   the checkout total is calculated, **Then** the discount is 200 THB and the
   grand total is 1,800 THB with the discount shown as a separate line item.

---

### User Story 3 - Promotion Rules and Safe Totals (Priority: P3)

As a shopper, I want the system to enforce eligibility rules and safe totals so
I am not misled by invalid or incorrect discounts.

**Why this priority**: Rule enforcement protects revenue and prevents incorrect
pricing.

**Independent Test**: Can be fully tested by applying expired or overused
coupons and by stacking discounts with known expected math.

**Acceptance Scenarios**:

1. **Given** coupon "EXPIRED" with an expiration date of yesterday, **When** the
   user applies "EXPIRED" today, **Then** the system rejects the coupon, leaves
   the total unchanged, and shows "Coupon expired".
2. **Given** coupon "WELCOME" is limited to one use per customer and the user
   has already used it, **When** they apply it again, **Then** the system
   rejects the coupon, leaves the total unchanged, and shows "Usage limit
   reached".
3. **Given** a 1,000 THB cart with two discounts (10% and 100 THB), **When**
   both discounts are applied, **Then** the system calculates as
   (1,000 - 10%) - 100 = 800 THB and not (1,000 - 100) - 10%.
4. **Given** a 50 THB cart and a 100 THB coupon, **When** the coupon is applied,
   **Then** the final total is 0 THB and never negative.

---

### Edge Cases

- Coupon usage exceeds per-customer limits and must be rejected.
- Discount stacking order must follow the defined rule: percentage first, fixed
  amount second.
- Coupon value exceeds cart total and the final total must be clamped to 0 THB.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST validate coupon minimum spend before applying any
  coupon discount.
- **FR-002**: System MUST apply valid fixed-amount coupon discounts to the cart
  total and display a success message.
- **FR-003**: System MUST calculate cart-level percentage discounts as
  `cart_total * percent` and display the discount as a separate line item.
- **FR-004**: System MUST reject expired coupons and leave cart totals
  unchanged.
- **FR-005**: System MUST enforce per-customer usage limits by checking prior
  usage history.
- **FR-006**: When multiple discounts are applied, the system MUST apply
  percentage discounts before fixed-amount discounts.
- **FR-007**: System MUST prevent negative totals by clamping the final total to
  0 THB.
- **FR-008**: System MUST provide a clear error message for rejected coupons.
- **FR-009**: System MUST show discount line items and the resulting grand total
  at checkout.

### Key Entities *(include if feature involves data)*

- **Cart**: Current items, subtotal, and computed totals.
- **Coupon**: Code, value, minimum spend, expiration date, and usage limit.
- **Promotion**: Percentage-based cart discount definition and validity.
- **Discount Application**: Records applied discounts and order of operations.
- **Usage History**: Per-customer coupon usage records.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of defined acceptance scenarios pass for promotions and
  discounts.
- **SC-002**: Users see a discount breakdown and grand total for every checkout
  where a promotion applies.
- **SC-003**: Invalid or expired coupons are rejected with the correct message
  and no change in total in 100% of tested cases.
- **SC-004**: Final totals never display below 0 THB in any tested scenario.

## Assumptions

- Prices and discounts are in THB and rounded to the nearest whole currency unit.
- Only one coupon code can be applied at a time.
- At most one cart-level percentage promotion is active at a time.
- Taxes, shipping, and fees are out of scope for promotion calculations unless
  specified later.
- "Today" and "yesterday" are based on the store's local timezone.
- Per-customer usage is determined by the authenticated customer identifier.
