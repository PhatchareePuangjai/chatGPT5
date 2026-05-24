# Research: Shopping Cart System

## Decision: Use TypeScript across backend and frontend

**Rationale**: Shared cart concepts such as item status, totals, and stock rejection
states benefit from compile-time checking across Express handlers, services, and React
components. The constitution requires clear module boundaries and testable contracts.

**Alternatives considered**: Plain JavaScript was simpler but weaker at maintaining
contract alignment. Runtime-only validation was retained for external input but is not
enough for internal maintainability.

## Decision: Store money as integer minor units and format for display

**Rationale**: The specification requires `19.99 * 3` to display exactly as `59.97`.
Integer minor units avoid binary floating-point display artifacts and keep totals
deterministic.

**Alternatives considered**: Native floating-point arithmetic was rejected because it
can produce precision artifacts. Decimal libraries are acceptable for formatting and
conversion but still need a consistent storage convention.

## Decision: Model cart item status as `active` or `saved`

**Rationale**: The feature requires saved items to stay associated with the shopper
while being excluded from checkout totals. A status field supports one list for active
checkout items and one list for saved items without losing item history.

**Alternatives considered**: Separate active and saved tables were rejected for this
feature because status transitions are simple and a single cart item table keeps
movement between lists transactional.

## Decision: Enforce one active cart row per SKU per cart

**Rationale**: Duplicate SKU additions must merge into the existing row. The data layer
should enforce this invariant in addition to service-level merge logic.

**Alternatives considered**: Handling duplicates only in application code was rejected
because concurrent requests could still create duplicate active rows.

## Decision: Validate stock in the cart mutation transaction

**Rationale**: Stock checks must account for current cart quantity plus requested new
quantity and preserve the existing cart state on failure. Performing validation and
mutation in one transaction avoids partial updates.

**Alternatives considered**: Client-side stock checks alone were rejected because they
can be stale. Non-transactional server checks were rejected because concurrent changes
could violate stock limits.

## Decision: Return the full updated cart after each mutation

**Rationale**: Quantity update, duplicate merge, and save-for-later interactions all
require immediate line total, grand total, active item, and saved item updates. Returning
the full cart reduces client-side reconciliation risk.

**Alternatives considered**: Returning only the changed line item was rejected because
the frontend would still need another source of truth for totals and saved item state.

## Decision: Define OpenAPI contract for cart operations

**Rationale**: The cart exposes HTTP operations used by the React frontend and must be
contract-tested. OpenAPI gives downstream planning and tests a concrete contract.

**Alternatives considered**: Informal route notes were rejected because they are harder
to validate and keep synchronized with implementation.

## Decision: Use layered tests with story-level coverage

**Rationale**: The constitution requires risk-based tests. Cart behavior spans money
math, stock validation, persistence constraints, HTTP contracts, and user interaction,
so no single test type is sufficient.

**Alternatives considered**: End-to-end-only testing was rejected because it would make
math and transaction failures harder to isolate.
