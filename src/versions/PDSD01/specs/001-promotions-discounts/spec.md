# Feature Specification: Promotions & Discounts

**Feature Branch**: `[001-promotions-and-discounts-system]`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Create a specification based on the requirements in scenarios_promotions.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apply Coupon Code (Priority: P1)

As a shopper checking out, I want to apply a coupon code and immediately see whether it is valid, how
much it discounts, and the updated total, so I can trust the final price before paying.

**Why this priority**: Coupon entry and validation is a core checkout experience and must be reliable.

**Independent Test**: Using a test cart and known coupons, apply codes and confirm totals and
messages match the scenarios below.

**Acceptance Scenarios**:

1. **Given** a cart total of **1,000 บาท** and a coupon **"SAVE100"** with a minimum spend of
   **500 บาท**, **When** the user enters **"SAVE100"** and applies it, **Then** the system approves
   the coupon (**1,000 >= 500**), reduces the total by **100 บาท** (new total **900 บาท**), and shows
   **"ใช้คูปองสำเร็จ"**.
2. **Given** a coupon **"EXPIRED"** that expired **yesterday**, **When** the user tries to apply
   **"EXPIRED"** **today**, **Then** the system rejects it, the cart total does **not** change, and
   shows **"คูปองหมดอายุ"**.

---

### User Story 2 - Automatic Cart Total Percentage Discount (Priority: P2)

As a shopper, I want applicable percentage promotions to be calculated correctly at checkout and shown
clearly, so I understand how the discount affects my final total.

**Why this priority**: Promotions that apply automatically must be transparent and consistently
calculated to prevent pricing disputes.

**Independent Test**: With a cart total that qualifies for a percentage promotion, open checkout and
confirm the discount line and grand total match the expected math.

**Acceptance Scenarios**:

1. **Given** a cart total of **2,000 บาท** and an applicable **10%** cart-total promotion,
   **When** checkout totals are calculated, **Then** the discount equals **200 บาท**
   (**2,000 x 10%**), the grand total equals **1,800 บาท**, and the discount is shown as a distinct
   line item.

---

### User Story 3 - Promotion Guardrails (Limits, Ordering, and Non-Negative Totals) (Priority: P3)

As a shopper, I want the system to enforce promotion rules (usage limits and calculation ordering) and
prevent incorrect totals (such as negative amounts), so discounts remain fair and predictable.

**Why this priority**: Edge cases and rule enforcement prevent revenue loss, abuse, and user distrust.

**Independent Test**: Use test carts and test users with known coupon history to validate each rule is
enforced and totals remain correct.

**Acceptance Scenarios**:

1. **Given** a coupon **"WELCOME"** that is limited to **1 use per user**, and the user already used
   it in **Order #1**, **When** the same user attempts to apply **"WELCOME"** again on **Order #2**,
   **Then** the system rejects the coupon, shows **"คุณใช้สิทธิ์ครบแล้ว"**, and does not reduce the
   Order #2 total.
2. **Given** a cart with **1,000 บาท** and two discounts applied together (**10%** and **100 บาท**),
   **When** the system calculates the final total, **Then** it applies the discounts in the defined
   order and produces **800 บาท** using **(1,000 - 10%) - 100**, and must not produce an incorrect
   value such as **810 บาท**.
3. **Given** a cart total of **50 บาท**, **When** a discount worth **100 บาท** is applied,
   **Then** the final payable total is never negative and is **0 บาท** (or the discount is rejected
   according to the rule), and the system never displays a negative grand total.

---

### Edge Cases

- What happens when a user enters an unknown/invalid coupon code?
- What happens when multiple promotions are simultaneously applicable (beyond one coupon + one cart
  promotion), and which ones take precedence?
- How does the system handle rounding for percentage discounts (e.g., fractional บาท)?
- How does the system handle coupon validation when the cart contents change after applying a coupon?
- What happens when a coupon is valid but a later edit causes the cart to fall below minimum spend?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a user to enter a coupon code and attempt to apply it to the current
  cart/checkout.
- **FR-002**: System MUST validate coupon eligibility before applying any discount, including minimum
  spend thresholds.
- **FR-003**: System MUST reject expired coupons and MUST keep the cart total unchanged when a coupon
  is rejected.
- **FR-004**: System MUST enforce per-user coupon usage limits (e.g., 1 use per user) before
  approving discounts.
- **FR-005**: System MUST calculate cart-total percentage promotions correctly and show the discount
  as a distinct line item.
- **FR-006**: System MUST support applying multiple discounts in a well-defined calculation order,
  and MUST compute totals according to that rule.
- **FR-007**: System MUST prevent negative grand totals; final payable total MUST be at least
  **0 บาท**.
- **FR-008**: System MUST show clear user-facing messages for key outcomes:
  - Success: **"ใช้คูปองสำเร็จ"**
  - Expired: **"คูปองหมดอายุ"**
  - Usage limit reached: **"คุณใช้สิทธิ์ครบแล้ว"**
- **FR-009**: System MUST present a transparent price breakdown including: original cart total,
  discount line(s), and grand total.
- **FR-010**: System MUST retain enough history to determine whether a user has already used a
  limited coupon (for audit and abuse prevention).

### Key Entities *(include if feature involves data)*

- **Cart**: The in-progress purchase containing items and a pre-discount total.
- **Coupon**: A redeemable code with eligibility rules (e.g., minimum spend, expiration, value).
- **Promotion**: An automatically applied discount rule (e.g., cart-total percentage).
- **Discount Application**: The applied discount(s) on a cart/order, including ordering and amounts.
- **Coupon Redemption History**: Record of which user used which coupon and when, used to enforce
  usage limits and support audits.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the acceptance scenarios in this specification pass in automated tests.
- **SC-002**: For all supported discount combinations, the calculated grand total is consistent with
  the defined ordering rule (no known incorrect order-of-operations outcomes).
- **SC-003**: The system never produces a negative payable amount (0 occurrences in test suites and
  monitoring over a 30-day period after release).
- **SC-004**: At least 95% of users who apply a valid coupon can complete checkout without needing
  support intervention (measured via support/contact rate).

## Assumptions

- Prices and totals are expressed in **บาท (THB)**.
- Only **one coupon code** is applied per order at a time; automatic promotions may still apply.
- Default stacking order for combined discounts is: apply percentage discounts first, then fixed-amount
  discounts (as reflected in the scenarios).
- Coupon expiration is evaluated using the store’s configured local date (not the user’s device time).
- Enforcing “per-user” limits assumes the user has a stable identity (e.g., logged-in user or another
  consistent identifier).
