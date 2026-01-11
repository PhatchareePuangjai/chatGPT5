# Promotions & Discounts System (Order of Operations Safe)

## Quick start (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/health
- DB: localhost:5432 (user/pass/db = app/app/promo)

## Key business rules
- Coupon validation: code must exist & active, not expired, and order total must meet minimum purchase.
- Usage limit: `one_time_per_user` coupons are validated against `user_coupon_history`.
- Calculation order: `(Original - PercentDiscount) - FixedDiscount`
- Precision: integer satang math (THB*100).
- Negative protection: grand total is clamped with `Math.max(0, ...)`.

## Demo IDs
The DB seeds a demo user and two orders:
- user: `11111111-1111-1111-1111-111111111111`
- seeded 50 THB order: `22222222-2222-2222-2222-222222222222`
- seeded 600 THB order: `33333333-3333-3333-3333-333333333333`

## Demo coupons
- `SAVE100` => fixed 100 THB, one-time per user
- `SAVE10P` => 10% percent discount
- `MIN500100` => fixed 100 THB, min 500 THB, one-time per user
- `EXPIRED50` => expired fixed 50 THB

## Self-refinement edge case
If you apply `SAVE100` to the seeded 50 THB order, the backend clamps the grand total to 0
and also records the *actual* fixed discount applied as 50 THB (5000 satang) so the order audit
fields match reality.
