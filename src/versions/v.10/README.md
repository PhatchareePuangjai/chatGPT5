# Shopping Cart App — Docker Quick Start

This guide explains how to boot the **frontend (React + Vite)**, **backend (Node.js + Express)**, and **Postgres database** together with Docker.

## 1. Prerequisites
- Docker Desktop installed and running.
- Repository cloned locally.

## 2. Start Everything (One Command)
From `src/versions/v.4/shopping-cart-app/` run:

```bash
docker compose up --build
```

This builds frontend & backend images, starts Postgres, seeds the database, and streams logs for every service. The first run may take a few minutes while dependencies install.

### URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Postgres: localhost:5432 (`shop` / `shop`)

## 3. Stop & Clean Up
Press `Ctrl + C`, then run:

```bash
docker compose down
```

If you need a full reset (remove volumes/data):

```bash
docker compose down -v
```

## 4. Troubleshooting
- **Port already in use:** Stop any local services occupying 5173, 4000, or 5432, then rerun `docker compose up --build`.
- **Schema drift:** Run `docker compose down -v` to drop volumes, then start again.
- **Slow rebuilds:** Use `docker compose build --no-cache` to force a clean image rebuild.

With Docker running, the React frontend automatically proxies API calls to the Express backend, and both interact with the Postgres database using the seeded fixtures.
