# Data Model: Inventory Stock Operations

Date: 2026-05-30

This document describes the logical data model (entities, fields, relationships) for the feature.

## Entities

### Product

Represents a sellable SKU with on-hand stock and alerting threshold.

Fields:

- `id` (identifier)
- `sku` (string, unique)
- `on_hand` (integer, >= 0)
- `low_stock_threshold` (integer, >= 0)
- `created_at`, `updated_at` (timestamps)

Constraints:

- `on_hand` MUST NOT be negative.
- `sku` MUST be unique.

Indexes:

- Unique index on `sku`.

### InventoryLog

Immutable audit log of stock mutations.

Fields:

- `id` (identifier)
- `product_id` (foreign key -> Product)
- `type` (enum-like string: `SALE`, `RESTOCK`, `RETURN`)
- `delta` (integer; negative for deduction, positive for restoration)
- `order_id` (optional foreign key -> Order, when applicable)
- `created_at` (timestamp)

Constraints:

- `delta` MUST NOT be 0.
- `type` MUST match the sign/meaning of `delta` (e.g., SALE implies negative).

Indexes:

- Index on `product_id`.
- Index on `created_at`.

### StockAlert

Records when a product is at/below threshold.

Fields:

- `id` (identifier)
- `product_id` (foreign key -> Product)
- `threshold` (integer)
- `observed_on_hand` (integer)
- `created_at` (timestamp)

Constraints:

- Alerts are generated when `observed_on_hand <= threshold`.

Notes:

- This model intentionally records the alert; delivery/notification channels are out of scope for
  this feature.

Indexes:

- Index on `product_id`.
- Index on `created_at`.

### Order

Represents a purchase that can cause stock deduction and later restoration.

Fields:

- `id` (identifier)
- `status` (string; at minimum supports "paid", "canceled", "expired")
- `created_at`, `updated_at` (timestamps)

Notes:

- Order line-items are implied by the feature scenarios (SKU + quantity). If the system needs
  multi-item orders, add an `OrderItem` entity in a follow-on change.

## Relationships

- Product 1 -> many InventoryLog
- Product 1 -> many StockAlert
- Order 1 -> many InventoryLog (optional link via `order_id`)

## State Transitions (High-Level)

- Purchase success: Product.on_hand decreases; InventoryLog inserted; StockAlert inserted if
  boundary crossed or condition met.
- Cancel/expire: Product.on_hand increases; InventoryLog inserted.
