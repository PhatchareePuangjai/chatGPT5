# Research: Promotions and Discounts

**Feature**: `specs/001-promotions-discounts/spec.md`  
**Date**: 2026-05-29

## Decisions

### Money representation

- Decision: Represent money as integer minor units (satang) end-to-end in storage and calculations.
- Rationale: Avoid floating point precision issues in percentage discounts and totals.
- Alternatives considered:
  - Decimal/fixed-point types: viable, but integer minor units keeps rules simple across services.
  - JS number with rounding: too error-prone for currency.

### Discount calculation order

- Decision: Apply cart-level percentage discounts first, then fixed-amount discounts (coupons), then clamp
  grand total to a minimum of 0.
- Rationale: Matches scenarios in `scenarios_promotions.md` and removes ambiguity.
- Alternatives considered:
  - Fixed first then percent: produces different totals and breaks the documented expected result.

### Rounding policy (percentage discounts)

- Decision: Round percentage discount amounts to the nearest satang using standard half-up rounding before
  applying to totals.
- Rationale: Deterministic behavior and auditable discount line items.
- Alternatives considered:
  - Always round down: can systematically bias totals.
  - Bankers rounding: less intuitive for business stakeholders.

### Coupon usage-limit enforcement

- Decision: Enforce per-user usage limits by recording redemptions in a `coupon_redemptions` table with a
  unique constraint on (`coupon_id`, `user_id`) for one-time coupons.
- Rationale: Guarantees correctness under concurrency and across services.
- Alternatives considered:
  - Query order history only: works but is slower and harder to index/lock correctly.

### API contract surface

- Decision: Treat totals calculation as an explicit API contract (request/response schema) and log applied
  discounts as line items returned from the API.
- Rationale: Prevents “magic” logic and supports UX requirements for clear discount display.
- Alternatives considered:
  - UI-only calculation: risks divergence from server truth and makes enforcement harder.

