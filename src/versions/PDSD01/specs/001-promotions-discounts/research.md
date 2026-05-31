# Research: Promotions & Discounts

**Date**: 2026-05-31
**Spec**: `specs/001-promotions-discounts/spec.md`

## Decisions

### Decision: Discount stacking order

- **Chosen**: Apply percentage discounts first, then fixed-amount discounts.
- **Rationale**: Matches the explicit scenario expectation: `(1,000 - 10%) - 100 = 800` and rejects
  the alternative ordering that would produce `810`.
- **Alternatives considered**:
  - Fixed-amount first (rejected because it conflicts with scenario expectation)
  - “Best for customer” (rejected because it can be non-deterministic and requires policy choices)

### Decision: Non-negative totals

- **Chosen**: Clamp final payable total to a minimum of 0 (or reject if policy requires).
- **Rationale**: Scenario explicitly forbids negative totals and accepts 0 as a safe outcome.
- **Notes**: Prefer clamping for predictable UX; if rejection is chosen later, keep the same test cases.

### Decision: Date handling for expiration

- **Chosen**: Evaluate expiration using a server-configured store timezone and “date” semantics, not
  client device time.
- **Rationale**: Prevents inconsistent outcomes and abuse; matches business expectations.

### Decision: Rounding policy (percentage discounts)

- **Chosen**: Round monetary values to the smallest currency unit using a single, documented policy.
- **Rationale**: Prevents off-by-one pricing discrepancies and makes tests deterministic.
- **Deferred detail**: Exact rounding rule (floor/nearest) should be documented once business policy is
  confirmed, but the system must use one rule consistently.

### Decision: Coupon usage limits

- **Chosen**: Enforce “1 use per user” via authoritative redemption history persisted at order
  completion (and optionally reserved during checkout to prevent race conditions).
- **Rationale**: Scenarios require history lookup before applying discounts; persistence is required for
  audit and prevention.

## Risks and Mitigations

- **Race condition on usage limit**: Two checkouts could apply the same limited coupon concurrently.
  - Mitigation: reservation/locking strategy at apply-time or enforce at order-finalization with a clear
    user message on failure.
- **Order-of-operations drift**: Different code paths could compute totals differently.
  - Mitigation: single pricing module + contract tests around pricing breakdown output.
- **Rounding disagreements**: Stakeholders may expect a specific rounding rule.
  - Mitigation: document rounding explicitly and lock it with tests.

