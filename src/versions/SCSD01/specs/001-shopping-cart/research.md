# Research: Shopping Cart Core Behaviors

**Date**: 2026-06-01  
**Spec**: specs/001-shopping-cart/spec.md  

## Decisions

### Money Arithmetic (Precision)

Decision: Represent money using an exact representation (minor units) and avoid floating point in all
business logic.

Rationale:
- The spec explicitly forbids floating point artifacts (e.g., 59.9700000000004).
- Integer minor units (cents) are deterministic and easy to test.

Alternatives considered:
- Decimal floating point types in application code: still risk formatting/rounding mistakes across layers.
- Using binary floating point with rounding at boundaries: error-prone and tends to leak artifacts.

Notes:
- Persist unit prices and computed totals in minor units (e.g., cents) or a DB-safe decimal with fixed
  scale, but never as floating point.

### Stock Enforcement (Atomicity)

Decision: Stock checks are evaluated against (current cart quantity + requested delta) and updates are
applied atomically (either the cart mutation succeeds, or the cart remains unchanged).

Rationale:
- The edge case requires `(CurrentCartQty + NewQty) <= Stock` and state preservation on rejection.
- Prevents transient invalid states visible to the user.

Alternatives considered:
- Best-effort updates with later correction: violates "preserve previous cart state" requirement.

### Duplicate Merge Rule

Decision: For a given cart and SKU, there is exactly one Active cart line. Repeated add-to-cart merges
into that line; it never creates duplicates.

Rationale:
- Acceptance scenario requires no duplicate rows and correct totals.

Alternatives considered:
- Separate lines per add-to-cart action: increases complexity and fails acceptance criteria.

### "Save For Later" Semantics

Decision: Saving an item changes its status from Active to Saved and removes it from the checkout
calculation (grand total).

Rationale:
- Acceptance scenarios require the item to move lists and totals to drop.

Alternatives considered:
- Keeping item in active list with a flag: easy to miscompute totals and UI expectations.

### Observability

Decision: Each cart mutation emits structured logs including a request identifier and an explicit result
(applied/rejected), and captures enough context to debug stock failures and money issues.

Rationale:
- Constitution requires debuggability and actionable errors.

Alternatives considered:
- Minimal logging: slows diagnosis of stock boundary and rounding issues.

