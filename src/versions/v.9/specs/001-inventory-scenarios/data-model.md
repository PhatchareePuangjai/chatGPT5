# Data Model: Inventory Stock Integrity

## InventoryItem
- **Fields**: sku (string, unique), quantity (int, >= 0),
  low_stock_threshold (int, >= 0), updated_at (datetime)
- **Rules**: quantity MUST never be negative; threshold used for alerts.

## InventoryLog
- **Fields**: id (uuid), sku (string), change_type (enum: SALE, RESTOCK_RETURN),
  quantity_delta (int), order_id (string, optional), created_at (datetime)
- **Rules**: every stock change MUST produce a log entry in the same transaction.

## StockAlert
- **Fields**: id (uuid), sku (string), threshold (int), quantity (int),
  status (enum: OPEN, ACKED), created_at (datetime)
- **Rules**: created when quantity <= threshold after a stock change.

## OrderReservation
- **Fields**: id (string), sku (string), quantity (int, > 0),
  status (enum: RESERVED, COMPLETED, CANCELED, EXPIRED),
  expires_at (datetime, optional)
- **Rules**: cancellation or expiration restores stock.

## Relationships
- InventoryItem 1..* InventoryLog
- InventoryItem 1..* StockAlert
- OrderReservation references InventoryItem via sku

## State Transitions
- OrderReservation: RESERVED -> COMPLETED (purchase)
- OrderReservation: RESERVED -> CANCELED or EXPIRED (restore stock)

## Validation Rules
- Reject any request where requested quantity > available inventory.
- Prevent overselling under concurrent access via row-level locks.
- Only create low-stock alerts when quantity <= threshold.
