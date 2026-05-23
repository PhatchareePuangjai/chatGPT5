# Data Model: Inventory Stock Operations

**Date**: 2026-05-23
**Spec**: `specs/001-scenarios-spec/spec.md`

## Entities

### SKU
Represents a sellable item.

Fields:
- `id` (identifier)
- `code` (unique business identifier, e.g., "SKU-001")
- `on_hand_qty` (non-negative integer)
- `low_stock_threshold` (non-negative integer)
- `created_at`
- `updated_at`

Rules:
- `on_hand_qty` MUST never be negative.
- Low-stock condition is met when `on_hand_qty <= low_stock_threshold`.

### Order
Represents a purchase intent and lifecycle.

Fields:
- `id` (identifier)
- `status` (one of: pending, confirmed, canceled, expired)
- `created_at`
- `updated_at`

Notes:
- This spec focuses on inventory impact at status transitions rather than full checkout domain.

### OrderLine
Represents a SKU quantity associated with an order.

Fields:
- `id`
- `order_id`
- `sku_id`
- `qty` (positive integer)

### InventoryLog
Auditable inventory change record.

Fields:
- `id`
- `sku_id`
- `delta_qty` (signed integer, e.g. -2 or +1)
- `reason` (e.g., sale, restock_return)
- `reference_type` (e.g., order)
- `reference_id` (e.g., order id)
- `created_at`

Rules:
- Every successful change to `SKU.on_hand_qty` MUST have exactly one corresponding `InventoryLog`.

### LowStockAlert
Represents an alert that a SKU is at/below threshold.

Fields:
- `id`
- `sku_id`
- `on_hand_qty_at_trigger`
- `threshold_at_trigger`
- `created_at`

Rules:
- Alerts SHOULD be idempotent for a given SKU while it remains at/below threshold (avoid alert spam).

## Relationships

- `Order` 1..N `OrderLine`
- `OrderLine` N..1 `SKU`
- `SKU` 1..N `InventoryLog`
- `SKU` 1..N `LowStockAlert`

## State Transitions (Order)

- pending -> confirmed: deduct inventory and write audit log
- pending -> canceled OR pending -> expired: restore inventory and write audit log (only if inventory was reserved)

## Validation & Consistency Rules

- Overselling attempt (requested qty > available): reject without writing inventory or logs.
- Concurrency test requires: at most one confirmation succeeds when only one unit remains.
- Transaction atomicity requires: inventory update and inventory log write happen as one unit of work.
