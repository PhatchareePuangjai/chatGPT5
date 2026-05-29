# Feature Specification: Promotions and Discounts

**Feature Branch**: `001-promotions-spec`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Create a specification based on the requirements in scenarios_promotions.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apply Coupon Code (Priority: P1)

As a shopper, I want to apply a coupon code during checkout so I can receive an immediate discount when I
meet the coupon conditions.

**Why this priority**: Directly impacts conversion and user trust at checkout.

**Independent Test**: A tester can create a cart totaling 1,000 THB, apply coupon "SAVE100" (min spend 500
THB), and verify the total becomes 900 THB and a success message is shown.

**Acceptance Scenarios**:

1. **Given** a cart total of 1,000 THB and coupon code "SAVE100" with a minimum spend of 500 THB,
   **When** the user enters "SAVE100" and applies it, **Then** the coupon is accepted, the discount of 100
   THB is applied, the new total is 900 THB, and the system shows "ใช้คูปองสำเร็จ".
2. **Given** a coupon code "EXPIRED" whose expiration date is in the past, **When** the user attempts to
   apply "EXPIRED" today, **Then** the coupon is rejected, the cart total does not change, and the system
   shows "คูปองหมดอายุ".

---

### User Story 2 - Cart Total Percentage Discount (Priority: P2)

As a shopper, I want percentage-based promotions to be calculated correctly on the cart total so I can
see a clear discount line item and the correct grand total.

**Why this priority**: Common promotion type; errors are highly visible and harm trust.

**Independent Test**: A tester can create a cart totaling 2,000 THB with a 10% cart promotion and verify a
discount of 200 THB and grand total of 1,800 THB with a clearly displayed discount line.

**Acceptance Scenarios**:

1. **Given** a cart total of 2,000 THB and an active cart promotion of 10%, **When** the checkout totals
   are calculated, **Then** the discount equals 200 THB and the grand total equals 1,800 THB, and the
   discount is displayed as a separate line item.

---

### User Story 3 - Correct Discount Rules and Safeguards (Priority: P3)

As a shopper, I want promotions to follow consistent calculation rules and safeguards so totals are
predictable, never negative, and usage rules are enforced.

**Why this priority**: Prevents edge-case financial errors and inconsistent outcomes.

**Independent Test**: A tester can validate (a) a one-time coupon cannot be reused by the same user, (b)
multiple discounts follow the defined calculation order, and (c) totals never go below zero.

**Acceptance Scenarios**:

1. **Given** coupon "WELCOME" is limited to one use per user and the user has already used it in a prior
   order, **When** the same user tries to apply "WELCOME" to a new order, **Then** the coupon is rejected,
   no discount is applied, and the system shows "คุณใช้สิทธิ์ครบแล้ว".
2. **Given** a cart subtotal of 1,000 THB with two discounts available (10% and 100 THB), **When** both
   discounts are applied, **Then** the total is calculated using the defined order of operations and the
   result is 800 THB.
3. **Given** a cart subtotal of 50 THB and a discount of 100 THB is applied, **When** totals are computed,
   **Then** the grand total is 0 THB (and must not be negative).

### Edge Cases

- Coupon usage limit enforcement when a user attempts to reuse a one-time coupon on a later order.
- Multiple discounts applied together: verify calculation order is consistent and documented.
- Discounts exceeding subtotal: grand total must not become negative.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a user to enter and apply a coupon code during checkout.
- **FR-002**: System MUST validate coupon minimum spend conditions and reject coupons that do not meet
  conditions.
- **FR-003**: System MUST reject expired coupons and keep totals unchanged when a coupon is rejected.
- **FR-004**: System MUST enforce per-user coupon usage limits (e.g., "1 time per person") across orders.
- **FR-005**: System MUST support cart-level percentage promotions and compute the discount and grand total
  correctly.
- **FR-006**: System MUST display the applied discount(s) as separate line item(s) and show a clear grand
  total after discounts.
- **FR-007**: When multiple discounts apply, the system MUST use a defined, deterministic order of
  operations; for this feature the expected order is percentage discounts first, then fixed-amount
  discounts.
- **FR-008**: System MUST prevent negative totals; when discounts exceed the subtotal, the grand total MUST
  be 0.
- **FR-009**: System MUST provide user-facing feedback messages for success and rejection states (e.g.,
  success, expired, usage limit reached).

### Non-Functional Requirements *(mandatory)*

- **NFR-UX**: UX MUST clearly show applied promotions, discount amounts, and the updated grand total with
  clear error messages when a promotion cannot be applied.
- **NFR-A11Y**: Coupon entry and promotion feedback MUST be accessible (keyboard operable and properly
  labeled).
- **NFR-PERF**: Users SHOULD see updated totals quickly after applying a coupon or recalculating checkout
  totals (no perceived lag for typical carts).
- **NFR-TEST**: All behavior changes in this promotions system MUST be covered by automated tests, including
  the acceptance scenarios and edge cases above.

### Key Entities *(include if feature involves data)*

- **Coupon**: A discount instrument with a code, conditions (e.g., minimum spend), validity period, and
  per-user usage limit rules.
- **Promotion**: A cart-level discount rule (e.g., a percentage off the cart total) that may be active based
  on defined eligibility.
- **Cart**: A collection of items with a subtotal and computed totals after applying discounts.
- **Order**: A completed purchase record used to determine coupon usage history for a user.
- **Discount Line Item**: A record shown to the user that explains each discount applied and its amount.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the defined acceptance scenarios pass in an automated test suite.
- **SC-002**: Grand totals are never negative in production (0 instances over a rolling 30-day window).
- **SC-003**: Users can apply a valid coupon and see updated totals within 2 seconds for typical carts.
- **SC-004**: Reduce promotion/coupon-related support contacts by 50% within 60 days of release (compared to
  the prior period).

## Assumptions

- Prices and discounts are expressed in THB and displayed using standard currency rounding to the smallest
  currency unit used by the business.
- Only one coupon code is applied per order at a time; cart-level promotions may still apply alongside a
  coupon.
- When discounts exceed the subtotal, the expected behavior is to clamp the grand total to 0 THB (not to
  create negative totals).
- A user identity exists to enforce per-user usage limits (e.g., the system can associate prior orders to a
  user).
