# Research: Shopping Cart Core Behaviors

**Date**: 2026-05-24
**Feature**: specs/001-shopping-cart/spec.md

## Decision 1: Money Calculation Strategy

**Decision**: Represent money in the smallest currency unit (e.g., cents) for all calculations and
storage, and format to 2 decimals only at presentation boundaries.

**Rationale**:

- Avoids floating point artifacts (spec Edge Case: 19.99 * 3 must be exactly 59.97).
- Makes addition/multiplication deterministic and testable.

**Alternatives considered**:

- Use floating point with rounding: higher risk of display artifacts and hidden drift.
- Use arbitrary-precision decimal library: acceptable, but still requires consistent conventions and
  adds dependency surface. Integer cents is simpler for typical currencies.

## Decision 2: Stock Validation Rule

**Decision**: Enforce `(current_cart_qty + requested_delta_or_new_qty) <= available_stock` as the
single authoritative rule for add/merge and quantity updates.

**Rationale**:

- Matches the explicit evaluation criteria in scenarios_cart.md.
- Prevents overselling in cart interactions.

**Alternatives considered**:

- Validate only the delta: incorrect when the cart already contains quantity.

## Decision 3: Cart Item Identity and Merge Semantics

**Decision**: Define "duplicate" as the same product identifier (SKU) in the same cart with active
status; merging means a single active cart line per SKU.

**Rationale**:

- Aligns with acceptance scenario: "No duplicate rows" and "merge quantities".

**Alternatives considered**:

- Allow duplicates as separate lines: violates spec.

## Decision 4: Save For Later Modeling

**Decision**: Saving an item removes it from the active cart item set and creates a saved item entry
for the same product, excluded from checkout totals.

**Rationale**:

- Aligns with acceptance scenario: item disappears from active list, totals decrease, item appears
  in saved list.

**Alternatives considered**:

- Soft-status on the same row (Active/Saved): workable, but often complicates uniqueness constraints
  and active totals; a separate saved list reduces risk and keeps "one active row per SKU" simple.

## Decision 5: Error Behavior on Stock Failure

**Decision**: Reject the operation atomically and keep the cart unchanged, returning an actionable
message ("insufficient stock").

**Rationale**:

- Explicitly required: keep quantity unchanged and show clear message.

## Open Questions (Deferred)

No critical open questions for planning. Implementation-specific choices (test runner, component
library, auth/session mechanism) will be selected when scaffolding the app, without changing feature
scope.
