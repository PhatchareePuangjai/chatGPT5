# Feature Specification: Inventory Management — Stock Mutation & Alerts

**Feature Branch**: `001-inventory-management`
**Created**: 2026-04-02
**Status**: Draft
**Input**: User description: "Create a specification based on the requirements in scenarios_inventory.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stock Deduction on Purchase (Priority: P1)

When a customer completes a purchase, the system reduces the available stock for the purchased
product and records the transaction. The buyer receives confirmation, and the inventory reflects
the updated quantity immediately.

**Why this priority**: Stock deduction is the core operation of any inventory system. Without it,
no other inventory feature has meaning. It is the minimum viable capability.

**Independent Test**: Place a purchase order for a known quantity; verify that the product's
stock count decreases by that exact quantity and a corresponding sale record appears in the
transaction log.

**Acceptance Scenarios**:

1. **Given** a product (SKU-001) has 10 units in stock, **When** a customer purchases 2 units
   and payment succeeds, **Then** the stock count decreases to 8, a log entry of type SALE
   with a quantity of -2 is created, and the system returns a Success status.
2. **Given** a product has 5 units in stock, **When** a customer attempts to purchase 6 units,
   **Then** the system rejects the request immediately, the stock count remains at 5, and no
   log entry is created.

---

### User Story 2 - Low Stock Alert on Threshold Breach (Priority: P2)

When a purchase causes available stock to fall at or below a pre-configured threshold, the
system automatically generates an alert to notify administrators that the product needs
restocking attention.

**Why this priority**: Unnoticed stock depletion leads to lost sales and poor customer
experience. Proactive alerting enables timely restocking decisions.

**Independent Test**: Purchase units from a product whose remaining count will reach the
configured threshold; verify an alert record is created. Purchase from a product that
remains above threshold; verify no alert is created.

**Acceptance Scenarios**:

1. **Given** a product (SKU-002) has 6 units with a low-stock threshold of 5, **When** a
   customer purchases 2 units (leaving 4), **Then** the stock count decreases to 4 and an
   alert record is generated because 4 ≤ 5.
2. **Given** a product has 7 units with a threshold of 5, **When** a customer purchases 1
   unit (leaving 6), **Then** the stock count decreases to 6 and no alert is generated
   because 6 > 5.
3. **Given** a product has 6 units with a threshold of 5, **When** a customer purchases 1
   unit (leaving exactly 5), **Then** an alert is generated because 5 ≤ 5.

---

### User Story 3 - Stock Restoration on Order Cancellation (Priority: P3)

When a previously placed order is cancelled by the customer or expires automatically, the
system returns the reserved quantity back to available stock and records the restoration.

**Why this priority**: Without restoration, cancellations permanently reduce available
inventory, leading to inaccurate stock counts and missed sales opportunities.

**Independent Test**: Cancel an existing order for a known quantity; verify stock increases
by that quantity and a restoration log entry is created.

**Acceptance Scenarios**:

1. **Given** a product (SKU-003) has 5 units in stock and an order reserving 1 unit is
   cancelled or expires, **Then** the stock count is restored to 6, and a log entry of
   type RESTOCK/RETURN with a quantity of +1 is created.

---

### Edge Cases

- **Concurrent purchases (race condition)**: When 5 simultaneous purchase requests arrive
  for a product with only 1 unit in stock, exactly 1 request must succeed and 4 must receive
  an Insufficient Stock error. The final stock count must be 0 — never negative.
- **Partial transaction failure (atomicity)**: If the system successfully deducts stock but
  then fails to write the log entry (e.g., due to a data store error), the entire operation
  must be rolled back. The result must never be "stock reduced with no log record."
- **Overselling in a single request**: A single request for a quantity exceeding available
  stock must be rejected before any data is written. The stock must remain unchanged.
- **Threshold boundary values**: For a threshold of 5, stock levels of 6, 5, and 4 must
  produce correct alert behaviour: 6 → no alert, 5 → alert, 4 → alert. The boundary
  condition (equal to threshold) MUST trigger an alert.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST reduce the product's available stock count by the exact purchased
  quantity immediately upon successful payment confirmation.
- **FR-002**: System MUST create a log entry of type SALE with a negative quantity delta
  within the same operation as the stock deduction (all-or-nothing).
- **FR-003**: System MUST return a Success status to the caller after a completed stock
  deduction.
- **FR-004**: System MUST generate a low-stock alert record when the post-deduction stock
  count is less than or equal to the product's configured threshold.
- **FR-005**: System MUST restore the product's stock count when an order is cancelled or
  expires, by the exact quantity that was reserved.
- **FR-006**: System MUST create a log entry of type RESTOCK/RETURN with a positive quantity
  delta within the same operation as the stock restoration.
- **FR-007**: System MUST reject any purchase request where the requested quantity exceeds
  available stock before performing any data write.
- **FR-008**: System MUST ensure stock quantity never falls below zero under any
  circumstance, including simultaneous concurrent requests.
- **FR-009**: System MUST ensure that stock deduction and its corresponding log entry either
  both succeed or both fail with no partial state persisted.
- **FR-010**: System MUST evaluate low-stock threshold using a less-than-or-equal-to
  comparison (stock ≤ threshold triggers alert; stock > threshold does not).

### Key Entities

- **Product**: Represents a stockable item. Key attributes: unique identifier (SKU), current
  available quantity, low-stock alert threshold.
- **InventoryLog**: An immutable record of every stock change. Key attributes: product
  reference, operation type (SALE / RESTOCK / RETURN), signed quantity delta, timestamp.
- **Order**: A customer's purchase request. Key attributes: product reference, requested
  quantity, current status (active / cancelled / expired).
- **Alert**: A notification record generated when stock falls to or below threshold. Key
  attributes: product reference, trigger type (LOW_STOCK), stock level at time of trigger.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of completed purchase transactions result in an exactly correct stock
  reduction with no discrepancy between the deducted quantity and the log record.
- **SC-002**: Low-stock alerts are generated for every stock level at or below the configured
  threshold and never generated above it — 0 false negatives and 0 false positives at
  boundary values.
- **SC-003**: Under simultaneous concurrent purchase attempts on a single remaining unit,
  the final stock count is always 0 with exactly 1 successful transaction recorded.
- **SC-004**: No stock mutation ever leaves the system in a partial state; every deduction
  is paired with its log entry or neither is applied.
- **SC-005**: 100% of cancelled or expired orders result in full stock restoration matching
  the original reserved quantity, with a corresponding restoration log entry.
- **SC-006**: Purchase requests for quantities exceeding available stock are rejected
  100% of the time before any stock change is written.

## Assumptions

- Each product has a single configurable low-stock threshold (e.g., ≤ 5 units); threshold
  values are set by administrators and are not within scope of this feature.
- Payment processing is handled by an external system; this feature receives a confirmed
  payment success event before executing stock deduction.
- Order cancellation and expiry events are triggered by external systems; this feature
  handles stock restoration upon receiving such events.
- Stock quantities are non-negative whole numbers; fractional quantities are out of scope.
- User authentication and authorisation are handled by an existing system; this feature
  assumes the caller's identity and permissions have already been verified.
- Reporting and analytics on InventoryLog data are out of scope for this feature.
