# Research: Promotions and Discounts

**Date**: 2026-04-03  
**Feature**: [spec.md](/Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/PDSD01/specs/001-promotions-spec/spec.md)

## Decisions

### Decision 1: Backend module within existing service
**Decision**: Implement as a backend service module that evaluates promotions at
checkout.  
**Rationale**: The scenarios describe cart evaluation, usage limits, and
expiration checks, which are best handled server-side to ensure consistency and
fraud resistance.  
**Alternatives considered**: Client-only evaluation (rejected due to trust and
consistency risks).

### Decision 2: Relational storage for coupons and usage history
**Decision**: Store coupon definitions and per-customer usage history in an
existing relational database.  
**Rationale**: Usage limits and expiration checks require reliable historical
queries with transactional guarantees.  
**Alternatives considered**: In-memory cache only (rejected due to durability
and accuracy requirements).

### Decision 3: Testing strategy
**Decision**: Unit tests for calculation logic and integration tests for coupon
validation and checkout total computation.  
**Rationale**: The correctness of order-of-operations and rejection behavior is
critical; integration tests protect against regressions at system boundaries.  
**Alternatives considered**: Unit-only testing (rejected due to high risk of
integration defects).

### Decision 4: Performance budget
**Decision**: Pricing evaluation completes under 200 ms p95 per checkout.  
**Rationale**: Discount calculation should not add noticeable latency to
checkout.  
**Alternatives considered**: No explicit budget (rejected due to constitution
requirement on performance budgets).

## Open Assumptions

- Backend stack uses Python 3.11 and pytest; adjust if the project uses a
  different language or test framework.
- The platform is a Linux-hosted backend service with existing cart and order
  flows.
