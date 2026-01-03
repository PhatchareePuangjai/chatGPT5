# Online Shop + Inventory System (Beginner Friendly)

This project is a simple online shop connected to an inventory system.

✅ Customers can buy items (stock goes down)  
✅ You can restock items (stock goes up)  
✅ Low-stock items (stock < 5) are shown and backend prints a LOW STOCK log  
✅ Stock change history is saved in the database  

---

## What you need to install

### Easiest: Docker Desktop
Install Docker Desktop (Windows/Mac), then restart if needed.

---

## How to start (Docker)

### 1) Open a terminal in this folder
This folder contains `docker-compose.yml`.

### 2) Start everything
Run:

```bash
docker compose up
```

First run may take a few minutes.

### 3) Open the website
- Shop page: http://localhost:5173
- Backend health check: http://localhost:3001/health

---

## How to stop

Press **CTRL + C** in the terminal window, then run:

```bash
docker compose down
```

---

## Database tables (created automatically)

When Docker starts the database for the first time, it automatically runs:

- `backend/sql/001_init.sql`  (creates tables)
- `backend/sql/002_seed.sql`  (adds example products)

Tables:
- `products`
- `stock_history`

---

## What to click in the app

### Shop tab
- Click **Buy 1** to purchase.
- If stock is 0, you cannot buy.

### Dashboard tab
- View inventory.
- See low-stock list.
- Click **Restock +5** to add stock.

---

## Troubleshooting

### "Port already in use"
Something else is using ports **5173**, **3001**, or **5432**.

Fix:
- close the other app, or
- change ports in `docker-compose.yml`

### Reset database (deletes data!)
```bash
docker compose down -v
docker compose up
```


## Fix note (Dec 2025)
If you previously saw an error like `productId must be a positive integer`, it was caused by the database returning BIGINT IDs as strings. This version accepts numeric strings and also converts IDs in the frontend.

<!-- Trigger CI -->
