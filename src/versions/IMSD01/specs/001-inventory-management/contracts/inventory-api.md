# Inventory API Contract

## Response Envelope (required)
```json
{
  "status": "success" | "error",
  "data": {},
  "error": "string | null"
}
```

## POST /inventory/purchase
Deduct stock after payment confirmation.

**Request**
```json
{
  "order_id": "uuid",
  "product_id": "uuid",
  "sku": "SKU-001",
  "quantity": 2
}
```

**Success (200)**
```json
{
  "status": "success",
  "data": {
    "product_id": "uuid",
    "sku": "SKU-001",
    "deducted": 2,
    "remaining": 8,
    "log_id": "uuid",
    "alert_id": "uuid | null"
  },
  "error": null
}
```

**Validation Failure (400)**
- Example error: `"Insufficient stock: requested 6, available 5"`

**Conflict (409)**
- Example error: `"Concurrent update detected, please retry"`

## POST /inventory/cancel
Restore stock for a cancelled or expired order.

**Request**
```json
{
  "order_id": "uuid",
  "product_id": "uuid",
  "sku": "SKU-003",
  "quantity": 1,
  "reason": "cancelled" | "expired"
}
```

**Success (200)**
```json
{
  "status": "success",
  "data": {
    "product_id": "uuid",
    "sku": "SKU-003",
    "restored": 1,
    "remaining": 6,
    "log_id": "uuid"
  },
  "error": null
}
```

**Validation Failure (400)**
- Example error: `"Order not cancellable"`
