# Feature Specification: Inventory Stock Integrity

**Feature Branch**: `001-inventory-scenarios`  
**Created**: 2026-01-19  
**Status**: Draft  
**Input**: User description: "สร้าง spec จาก @scenarios_inventory.md  Scenarios นี้"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deduct Stock on Purchase (Priority: P1)

As an operator, I need successful purchases to immediately reduce available
stock so that the inventory count is accurate for the next buyer.

**Why this priority**: Prevents overselling and preserves inventory accuracy.

**Independent Test**: Place a valid order for a known SKU and confirm the
inventory count and log reflect the deduction.

**Acceptance Scenarios**:

1. **Given** SKU-001 has quantity 10, **When** a customer purchases 2 and payment
   succeeds, **Then** inventory becomes 8, a SALE log with quantity -2 is
   created, and the system returns success.

---

### User Story 2 - Low Stock Alerts (Priority: P2)

As an inventory manager, I need to be alerted when stock falls to or below a
defined threshold so I can restock in time.

**Why this priority**: Prevents stockouts and keeps replenishment proactive.

**Independent Test**: Reduce a SKU below its threshold and confirm an alert
record/event is produced.

**Acceptance Scenarios**:

1. **Given** SKU-002 has quantity 6 and threshold 5, **When** a purchase of 2
   succeeds, **Then** inventory becomes 4 and a low-stock alert is created.

---

### User Story 3 - Restore Stock on Cancellation (Priority: P3)

As an operator, I need canceled or expired orders to restore reserved stock so
that inventory reflects available items.

**Why this priority**: Ensures inventory accuracy after order changes.

**Independent Test**: Cancel an order that reserved stock and verify the stock
is restored with a corresponding log entry.

**Acceptance Scenarios**:

1. **Given** SKU-003 has quantity 5, **When** a reserved order for 1 is canceled
   or expires, **Then** inventory becomes 6 and a RESTOCK/RETURN log with
   quantity +1 is created.

---

### Edge Cases

- Race condition when multiple buyers attempt to purchase the last unit at the
  same time.
- Transaction atomicity when logging fails after a stock deduction.
- Overselling attempt when a single order exceeds available stock.
- Low-stock boundary checks when quantity is 6, 5, and 4 against threshold 5.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST deduct inventory immediately after a successful
  purchase and reflect the new quantity in the inventory record.
- **FR-002**: System MUST create an inventory log entry for every stock change
  with change type (SALE or RESTOCK/RETURN) and quantity.
- **FR-003**: System MUST return success only when stock is sufficient and MUST
  reject orders that exceed available stock without changing inventory.
- **FR-004**: System MUST trigger a low-stock alert when quantity is less than
  or equal to the defined threshold and MUST NOT trigger when above it.
- **FR-005**: System MUST restore stock when an order is canceled or expires and
  log the restoration.
- **FR-006**: Stock deduction and inventory logging MUST be atomic so partial
  updates never persist.
- **FR-007**: Under concurrent purchase attempts, only available stock MUST be
  allocated and inventory MUST never go negative.

### Non-Functional Requirements

- **NFR-001**: UX consistency MUST follow existing patterns for wording,
  formatting, and error handling across user-facing outputs.
- **NFR-002**: Performance budgets MUST be defined and measurable for stock
  updates and alerts (e.g., stock updates complete within 2 seconds and alerts
  are emitted within 1 minute under expected load).

### Key Entities *(include if feature involves data)*

- **SKU/Inventory Item**: Identifies a stocked product and its current quantity.
- **InventoryLog**: Record of each stock change with type and quantity.
- **StockAlert**: Notification record/event when stock crosses a threshold.
- **Order/Reservation**: Represents a purchase or reservation that changes stock.

## Assumptions

- Low-stock thresholds exist per SKU and are configurable by inventory staff.
- Alerts are routed to inventory managers/administrators.
- Order cancellation/expiration events are already available to trigger
  restoration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of successful purchases immediately reduce stock and create a
  corresponding log entry.
- **SC-002**: In a test of 5 concurrent purchase attempts for the last unit, only
  1 succeeds and stock never becomes negative.
- **SC-003**: Low-stock alerts are generated for 100% of cases where quantity is
  less than or equal to the threshold, with zero alerts when above threshold.
- **SC-004**: 95% of stock updates complete within 2 seconds and alerts are
  emitted within 1 minute under expected load.
