# Shopping Cart (Exact cents + transactional stock checks)

## Run
```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend:  http://localhost:3001/health
- DB:       localhost:5432 (app/app)

## Key behaviors
- Duplicate SKU add merges into one row (per status).
- "Save for later" moves item to saved list and excludes it from active checkout total.
- Stock validation is enforced transactionally:
  (CurrentActiveCartQty + NewQty) <= Stock
- All money is integer cents (exact math).
