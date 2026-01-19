# Online Shop Inventory

## Overview
This project provides inventory integrity workflows for an online shop:
- Deduct stock on successful purchase
- Trigger low-stock alerts
- Restore stock on order cancellation or expiration

## Quick Start with Docker
Run the entire stack (frontend, backend, Postgres) with one command:

```bash
cd src/versions/v.9
docker compose up --build
```

Services:
- Frontend (Vite dev server): http://localhost:5173
- Backend API: http://localhost:8080/api
- Postgres: `localhost:5432` (`inventory` / `inventory`)

To stop everything:

```bash
docker compose down
```

Add `-v` to drop the database volume if you need a clean slate: `docker compose down -v`.

## Backend API
Base URL: `http://localhost:8080/api`

### Deduct stock
```
POST /inventory/:sku/deduct
{
  "quantity": 2,
  "order_id": "order-123"
}
```

### Restore stock
```
POST /inventory/:sku/restore
{
  "quantity": 1,
  "order_id": "order-123",
  "reason": "canceled"
}
```

### Get inventory
```
GET /inventory/:sku
```

### List alerts
```
GET /inventory/:sku/alerts
```

## Frontend
The frontend uses Vite + React and calls the backend API via `VITE_API_BASE_URL`.
