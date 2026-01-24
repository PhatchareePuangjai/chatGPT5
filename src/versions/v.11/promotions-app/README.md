# Promotions & Discounts App (v.11)

Full-stack reference implementation for the coupon scenarios defined in `scenarios_promotions.md`. The service exposes a checkout cart, validates coupons against database rules, and renders the result in a React client.

## Stack
- **Backend:** Node.js 20, Express 4, Postgres 15, Zod
- **Frontend:** React 18 (Vite)
- **Infrastructure:** Docker Compose for local dev

## Quick Start
```bash
cd src/versions/v.11/promotions-app
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm install --prefix backend
npm install --prefix frontend
npm run db:migrate --prefix backend
npm run db:seed --prefix backend
```

### Run services
```bash
# start Postgres (if using docker compose)
docker compose up --build
```

Frontend: http://localhost:5173  \
Backend API: http://localhost:4000

## API
- `GET /api/cart?userId=demo-user` — fetch cart totals + discount lines.
- `POST /api/promotions/apply` — body `{ "couponCode": "SAVE100", "userId": "demo-user" }`.

Errors return `{ "error": "message", "reason": "code" }` with Thai copy for user messaging.

## Tests
```bash
npm test --prefix backend
npm test --prefix frontend
```
(Requires dependencies installed.)
