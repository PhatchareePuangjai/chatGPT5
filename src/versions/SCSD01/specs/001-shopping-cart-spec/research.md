# Research: Shopping Cart Scenarios

**Date**: 2026-04-03

## Decisions

### Money Arithmetic
- **Decision**: Represent money as integer cents and format to two decimals for
  display.
- **Rationale**: Prevents floating-point artifacts (e.g., 59.9700000000004) and
  aligns with the edge-case requirement.
- **Alternatives considered**: Floating-point math with rounding each step.

### Stock Validation Rule
- **Decision**: Validate stock using `current_cart_qty + requested_qty <= stock`.
- **Rationale**: Matches the edge-case requirement and prevents overselling.
- **Alternatives considered**: Only checking requested_qty against stock.

### Save-for-Later State Model
- **Decision**: Cart items have a `status` of `ACTIVE` or `SAVED`; only `ACTIVE`
  items participate in totals.
- **Rationale**: Clean separation of checkout-ready and deferred items.
- **Alternatives considered**: Separate cart collections without shared item model.

### Total Recalculation
- **Decision**: Recompute line totals and cart totals on every quantity or status
  change.
- **Rationale**: Guarantees accurate totals and predictable behavior.
- **Alternatives considered**: Incremental deltas only.

### Front-End UI Scope
- **Decision**: Provide a lightweight browser UI for manual validation of cart
  behaviors using the same domain rules as the core library.
- **Rationale**: Enables quick, consistent verification of user-facing flows.
- **Alternatives considered**: CLI-only validation.
