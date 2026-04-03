# Data Model — Inventory Management

## Entities

### Product
- `id` (UUID, PK)
- `sku` (string, unique, required)
- `available_qty` (int, required, non-negative)
- `low_stock_threshold` (int, required, non-negative)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Validation**
- `available_qty >= 0`
- `low_stock_threshold >= 0`

### InventoryLog
- `id` (UUID, PK)
- `product_id` (FK -> Product.id)
- `operation` (enum: `SALE`, `RESTOCK`, `RETURN`)
- `quantity_delta` (int, signed; negative for sale, positive for restock/return)
- `created_at` (timestamp)

**Validation**
- `quantity_delta != 0`
- `SALE` must be negative
- `RESTOCK`/`RETURN` must be positive

### Order
- `id` (UUID, PK)
- `product_id` (FK -> Product.id)
- `requested_qty` (int, required, > 0)
- `status` (enum: `ACTIVE`, `CANCELLED`, `EXPIRED`)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Alert
- `id` (UUID, PK)
- `product_id` (FK -> Product.id)
- `trigger_type` (enum: `LOW_STOCK`)
- `stock_level` (int, required)
- `created_at` (timestamp)

## Relationships
- Product 1 — * InventoryLog
- Product 1 — * Order
- Product 1 — * Alert

## State Transitions
- Order: `ACTIVE` -> `CANCELLED` or `EXPIRED`
- Stock mutation is allowed only when Order is `ACTIVE` and payment confirmed.

## Notes
- Stock deduction and InventoryLog creation occur in the same transaction.
- Alert creation occurs in the same transaction when `available_qty <= low_stock_threshold`.
