# API Contracts: Inventory Stock Operations

Date: 2026-05-30

This document defines HTTP contracts for inventory mutations and alert visibility.

## Conventions

Headers:

- `X-Request-Id`: optional request id provided by client; echoed back if present, otherwise server
  generates one.

Success response body:

```json
{
  "data": {}
}
```

Error response body:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## 1) Deduct Stock on Purchase Success

`POST /api/inventory/deduct`

Request:

```json
{
  "orderId": "ORD-123",
  "sku": "SKU-001",
  "quantity": 2
}
```

Responses:

- `200 OK`: stock updated and log recorded

```json
{
  "data": {
    "sku": "SKU-001",
    "previousOnHand": 10,
    "onHand": 8,
    "inventoryLog": {
      "type": "SALE",
      "delta": -2
    },
    "lowStockAlertCreated": false
  }
}
```

- `400 Bad Request`: invalid input (missing fields, non-positive quantity)
- `404 Not Found`: unknown SKU
- `409 Conflict`: insufficient stock

Example `409`:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock.",
    "details": {
      "sku": "SKU-001",
      "requested": 6,
      "available": 5
    }
  }
}
```

Atomicity:

- Stock update, inventory log insert, and low-stock alert insert (when applicable) MUST occur in a
  single database transaction.

## 2) Restore Stock on Cancellation / Expiration

`POST /api/inventory/restore`

Request:

```json
{
  "orderId": "ORD-456",
  "sku": "SKU-003",
  "quantity": 1,
  "reason": "CANCELED"
}
```

Responses:

- `200 OK`: stock restored and log recorded

```json
{
  "data": {
    "sku": "SKU-003",
    "previousOnHand": 5,
    "onHand": 6,
    "inventoryLog": {
      "type": "RESTOCK/RETURN",
      "delta": 1
    }
  }
}
```

- `400 Bad Request`: invalid input
- `404 Not Found`: unknown SKU

Idempotency note:

- If the same `orderId` restoration event can be delivered multiple times, the service SHOULD
  provide idempotency (e.g., de-dup on `(orderId, sku, type)`).

## 3) List Low-Stock Alerts (Admin)

`GET /api/alerts/low-stock?limit=50`

Response:

```json
{
  "data": {
    "alerts": [
      {
        "sku": "SKU-002",
        "threshold": 5,
        "observedOnHand": 4,
        "createdAt": "2026-05-30T00:00:00Z"
      }
    ]
  }
}
```
