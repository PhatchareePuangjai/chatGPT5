# Shopping Cart App (One command: React + Node.js + Postgres)

This project is set up so you can start **everything** with **one command** using Docker.

## Requirements (only once)
- Install **Docker Desktop for Mac** and open it.

## Start (ONE command)
From the folder `shopping-cart-app/`:

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Stop
Press `Ctrl + C`, then:

```bash
docker compose down
```


## If you see Docker errors (important)
If you previously ran an older version, do a clean rebuild:

```bash
docker compose down -v
docker compose up --build
```


---

## What it includes
- Add to cart (same item increases quantity)
- Increase/decrease quantity (price updates immediately)
- Save for later (excluded from subtotal)
- Stock checks with DB transaction + row locks
- Accurate money math using **integer cents** (e.g., 19.99 = 1999)

---

## If you prefer running without Docker
See the original sections below.


---

# Shopping Cart App (React + Node.js + Postgres)

This is a ready-to-run **Shopping Cart** system with:

- Add to cart (same item increases quantity)
- Increase/decrease quantity (price updates immediately)
- **Save for Later** (items moved out of total calculation)
- **Stock check** before adding/updating quantity (with DB transaction + row locks)
- **Accurate money math** using **integer cents** (no floating point errors)

> Works on macOS. No authentication is included (single demo cart). You can add auth later.

---

## 0) Requirements

- **Node.js 20+** (recommended)
- **Docker Desktop** (recommended) OR a local Postgres 14+ installation

---

## 1) Quick start (recommended: Docker Postgres)

### A) Start the database
From the project root:

```bash
docker compose up -d db
```

This starts Postgres on `localhost:5432` with:

- DB: `shop`
- User: `shop`
- Password: `shop`

### B) Backend
Open a new terminal:

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Backend runs at: `http://localhost:4000`

### C) Frontend (React)
Open another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

Open the frontend in your browser and click **Add to cart**.

---

## 2) If you already have Postgres installed (no Docker)

Create a database and user and then update `backend/.env`.

Example (psql):

```sql
CREATE USER shop WITH PASSWORD 'shop';
CREATE DATABASE shop OWNER shop;
```

Then run:

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

---

## 3) API Overview

- `GET /api/products` → list products
- `GET /api/cart` → get cart + totals
- `POST /api/cart/items` → add item `{ productId, qty }`
- `PATCH /api/cart/items/:productId` → update quantity `{ qty }`
- `POST /api/cart/items/:productId/save` → toggle save for later `{ saved: true/false }`
- `DELETE /api/cart/items/:productId` → remove item

---

## 4) Money accuracy

All prices are stored and calculated in **integer cents** (e.g. 19.99 USD = 1999 cents).
The UI formats cents into `19.99`.

---

## 5) Common issues

### “connection refused” / DB not reachable
Make sure Docker DB is running:

```bash
docker compose ps
```

### Ports already in use
- Backend uses `4000`
- Frontend uses `5173`
- Postgres uses `5432`

Change them in:
- `backend/.env`
- `frontend/.env`
- `docker-compose.yml`

---

## 6) Folder structure

- `backend/` Node.js + Express API
- `frontend/` React UI (Vite)
- `db/` SQL migrations and seed data

Enjoy! 🙂
