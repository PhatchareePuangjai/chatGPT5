# Research: Inventory Stock Operations

Date: 2026-05-30

## Decision: Concurrency Control for Stock Deduction

Decision: Use a single database transaction that locks the product row before updating quantity.

Rationale: Prevents race conditions and guarantees no negative inventory under concurrent requests.

Alternatives considered:

- Optimistic concurrency with a version field: workable, but adds complexity and requires retry
  logic for correctness under bursts.
- Application-level mutex: fragile in multi-process / multi-instance deployment.

## Decision: Atomicity of Stock Update + InventoryLog (+ Alert)

Decision: Perform quantity update, log insert, and alert insert in the same transaction.

Rationale: The spec requires all-or-nothing behavior and forbids "stock changed but no log" states.

Alternatives considered:

- Asynchronous log writing: violates audit requirements and complicates failure handling.
- Outbox/event-driven logging: useful later, but unnecessary for initial scope.

## Decision: API Error Shape and Status Codes

Decision: Use a consistent error body with stable fields and standard HTTP status codes:

- `400` for validation errors
- `409` for insufficient stock / conflict under concurrent attempts
- `404` for unknown SKU

Rationale: Enables predictable client behavior and debuggability, and matches constitution intent.

## Decision: Low-Stock Threshold Boundary

Decision: Trigger alert when `quantity <= threshold` (inclusive).

Rationale: Matches scenario table boundary cases (6 no alert, 5 alert, 4 alert).
