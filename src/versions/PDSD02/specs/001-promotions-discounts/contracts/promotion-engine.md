# Contracts: Promotion Engine

**Feature**: `specs/001-promotions-discounts/spec.md`  
**Date**: 2026-05-29

Defines the deterministic behavior of the promotion/discount calculation logic.

## Inputs

- Cart snapshot:
  - `subtotalSatang` (integer >= 0)
  - optional existing `discountLines` (for idempotency)
- Eligible promotions (e.g., cart-level percent)
- Optional coupon (code + resolved coupon rules)
- User identity (for usage-limit checks)

## Outputs

- `discountLines[]` with explicit ordering and amounts (each amountSatang >= 0)
- `discountTotalSatang`
- `grandTotalSatang` (>= 0)
- Outcome status and user-facing message for coupon operations

## Calculation Rules

1. Validate coupon (if provided):
   - Expiration window
   - Minimum spend
   - Usage limit per-user
2. Apply cart-level percentage promotions:
   - Compute discount amount using integer arithmetic and the rounding policy defined in
     `specs/001-promotions-discounts/research.md`
3. Apply coupon fixed discount amount (if valid):
   - Discount cannot exceed the remaining amount after percent discounts
4. Clamp totals:
   - `grandTotalSatang = max(0, subtotalSatang - discountTotalSatang)`

## Required Tests

- Scenario parity with `scenarios_promotions.md` (valid coupon, percent promo, expired coupon, usage limit,
  order-of-operations, negative-total protection).
- Regression tests for any future changes in calculation rules.

