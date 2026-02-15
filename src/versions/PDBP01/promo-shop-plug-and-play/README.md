# Plug & Play Promo Shop (React + Node.js + Postgres) — One Command

This is a **ready-to-run** demo online shop with:
- ✅ Coupon codes (`SAVE100`, `WELCOME`)
- ✅ Expiration date checks
- ✅ One-time coupon per user (`WELCOME`)
- ✅ Automatic **10% discount** applied first, then coupon (math order enforced)
- ✅ No negative totals (clamped to 0)
- ✅ Stock checks (shows “Out of stock” as a popup)
- ✅ Clean, mobile-friendly UI with a clear totals box
- ✅ **One command** Docker setup (Frontend + Backend + Database)

---

## Requirements
- macOS with **Docker Desktop** installed

## Run (one command)
In the folder that contains `docker-compose.yml`:

```bash
docker-compose up --build
```

Open:
- Frontend: http://localhost:8080
- Backend health: http://localhost:4000/api/health

Stop:
```bash
Ctrl+C
docker-compose down
```

Reset everything (including database data):
```bash
docker-compose down -v
```

---

## How to use
1. Add products
2. Enter a **User ID** (this is how we track “one time per person” coupons)
3. Try coupons:
   - `SAVE100` → 100 baht off, only if **subtotal >= 500**
   - `WELCOME` → 100 baht off, **one time per user**
   - `EXPIRED10` → always expired (test)
4. Click **Update Total** to preview discounts
5. Click **Pay Now** to confirm purchase (this reduces stock & consumes one-time coupon usage)

---

## Discount calculation order (important)
1. Subtotal = sum(price × qty)
2. Automatic discount = 10% of subtotal
3. Coupon discount = applied after the 10% discount
4. Final total is never below 0

---

## Notes
- Product prices and stock are controlled by the backend (client cannot change prices).
- The database is Postgres, automatically created by Docker.
