# Inventory Management System (High Reliability + Concurrency Safe)

Stack:
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js (CommonJS) + Express
- DB: PostgreSQL + pg driver

Key guarantees:
- **Race condition safe**: Uses `SELECT ... FOR UPDATE` row locking.
- **Atomic transactions**: Stock update and logs are written in one transaction; failures rollback.
- **No overselling**: Validates quantity against stock *before* any write.
- **Low stock alert**: Triggers when `remainingStock <= 5` (or `<= LOW_STOCK_THRESHOLD` from `.env`).

UI highlights:
- Dashboard summary cards (Total Stock, Out of Stock Items, Recent Alerts)
- Product table with Buy button and **light red row tint when stock ≤ 5**
- Stress test section runs **5 concurrent** purchases and shows a real-time transaction list
- Inventory logs side drawer with timestamps and color badges
- Consistency indicators: each request has a client Transaction ID and Sync Status

---

## Run with Docker

From project root:

```bash
docker compose up --build
```

Open:
- UI: http://localhost:5173
- API health: http://localhost:3000/health

---

## Verify Low Stock Alert (≤ 5)

The seed product is `productId=1` and starts at **stock=6** so the boundary check is easy.

1. In the UI, use Product #1 and set Qty=1
2. Click **Buy** once
3. The product stock becomes **5** and the row turns light red
4. In the transaction stream you should see:
   - `lowStockAlertTriggered: true`
5. In logs you should see `SALE` and `LOW_STOCK_ALERT`

Backend uses `remainingStock <= threshold` (strict `<=`).

---

## Verify Race Condition (Stress Test)

Goal: if 5 concurrent requests attempt to buy the last unit, only 1 succeeds.

1. Set stock to 1 (SQL) or purchase down to 1:
   ```sql
   UPDATE products SET stock = 1 WHERE id = 1;
   ```
2. In the UI set:
   - Product ID = 1
   - Stress Qty = 1
3. Click **Run 5x Concurrent Purchases**

Expected:
- Exactly **1** request is **COMMITTED**
- The other 4 are **REJECTED** with HTTP 409 (Insufficient stock)
- Stock ends at **0** and never becomes negative

Why it works:
- Purchases lock the product row with `FOR UPDATE` so the last unit can only be deducted once.

---

## Verify UI updates without full page refresh

After each Buy/Restore:
- UI updates stock immediately (optimistic update)
- Then it fetches canonical state from `/api/products/:id` to confirm DB state and update logs
