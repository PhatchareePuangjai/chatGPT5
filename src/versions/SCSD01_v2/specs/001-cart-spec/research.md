# Research: Shopping Cart Scenarios

**Feature**: /Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/SCSD01-v2/specs/001-cart-spec/spec.md
**Date**: 2026-04-05

## Decision 1: Currency Precision Strategy

- **Decision**: Represent money in integer minor units (e.g., satang/cents) and
  format to two decimals for display.
- **Rationale**: Avoids floating point artifacts and guarantees exact totals.
- **Alternatives considered**:
  - Decimal floating point types (extra dependency and still risk of misuse).

## Decision 2: Cart Validation Rule for Stock

- **Decision**: Validate `(current_cart_qty + new_qty) <= available_stock` and
  reject updates that exceed stock with an explicit error.
- **Rationale**: Matches edge case requirement and prevents over-allocation.
- **Alternatives considered**:
  - Allow temporary overages (conflicts with acceptance criteria).

## Decision 3: Project Scope and Interface Shape

- **Decision**: Implement as an in-process cart module with a clear API surface
  (add item, update quantity, save for later, compute totals).
- **Rationale**: No external interface specified; a module keeps behavior
  testable and portable for future UI or API integration.
- **Alternatives considered**:
  - Full web service or UI scope (not required by current spec).

## Decision 4: Performance Budgets

- **Decision**: Cart operations should refresh totals within 1 second for 95% of
  interactions.
- **Rationale**: Aligns with success criteria and ensures responsive user
  experience for typical cart sizes.
- **Alternatives considered**:
  - No explicit budget (violates constitution requirement).
