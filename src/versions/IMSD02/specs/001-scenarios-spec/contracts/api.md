# API Contracts: Inventory Stock Operations

**Date**: 2026-05-23
**Spec**: `specs/001-scenarios-spec/spec.md`

## Conventions

- All request/response bodies are JSON.
- Error responses use a stable shape:
  - `code`: short machine-readable string
  - `message`: user-facing summary
  - `details` (optional): structured context for debugging

## Endpoints

### Confirm Order (deduct stock)
`POST /api/orders/{orderId}/confirm`

Purpose:
- Confirms an order and applies inventory deductions and audit logs.

Request body:
```json
{
  "confirmedAt": "2026-05-23T00:00:00Z"
}
```

Success response (200):
```json
{
  "orderId": "string",
  "status": "confirmed",
  "inventoryUpdates": [
    { "skuCode": "SKU-001", "deltaQty": -2, "newOnHandQty": 8 }
  ]
}
```

Errors:
- 409 `INSUFFICIENT_STOCK`: cannot fulfill requested qty; no inventory changes applied
- 404 `ORDER_NOT_FOUND`

### Cancel Order (restore stock)
`POST /api/orders/{orderId}/cancel`

Purpose:
- Cancels an order and restores inventory for previously reserved/held quantities (if applicable),
  writing audit logs for restorations.

Request body:
```json
{
  "canceledAt": "2026-05-23T00:00:00Z",
  "reason": "string"
}
```

Success response (200):
```json
{
  "orderId": "string",
  "status": "canceled",
  "inventoryUpdates": [
    { "skuCode": "SKU-003", "deltaQty": 1, "newOnHandQty": 6 }
  ]
}
```

Errors:
- 404 `ORDER_NOT_FOUND`

### Create/Update SKU (admin)
`PUT /api/skus/{skuCode}`

Purpose:
- Creates or updates SKU configuration used by inventory and alerts.

Request body:
```json
{
  "onHandQty": 10,
  "lowStockThreshold": 5
}
```

Success response (200):
```json
{
  "skuCode": "SKU-001",
  "onHandQty": 10,
  "lowStockThreshold": 5
}
```

### Get SKU (admin)
`GET /api/skus/{skuCode}`

Success response (200):
```json
{
  "skuCode": "SKU-001",
  "onHandQty": 8,
  "lowStockThreshold": 5
}
```

### List Alerts (admin)
`GET /api/alerts?status=active`

Success response (200):
```json
{
  "alerts": [
    {
      "skuCode": "SKU-002",
      "onHandQtyAtTrigger": 4,
      "thresholdAtTrigger": 5,
      "createdAt": "2026-05-23T00:00:00Z"
    }
  ]
}
```

## Non-Functional Contract Notes

- Confirm/cancel endpoints MUST be safe under concurrency (no negative stock, no partial updates).
- Audit logging is part of the contract: successful inventory updates imply corresponding audit records exist.
