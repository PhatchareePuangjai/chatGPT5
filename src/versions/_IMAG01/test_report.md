# Inventory Management System Test Report (IMAG01)

**Date:** March 1, 2026
**Project Version:** inventory-system IMAG01 (AI-generated)

## 1. Test Summary

All scenarios defined in `scenarios_inventory.md` have been tested using Jest (integration tests against the running Docker stack).

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced correctly. Log created (`type: "SALE"`, `quantity_change: -2`). |
| **2) Low Stock Alert Trigger** | ✅ PASS | Stock reduced. `alert_triggered: true` returned in response when stock ≤ threshold. |
| **3) Stock Restoration** | ✅ PASS | Stock restored via `/api/cancel`. Log created (`type: "RESTOCK/RETURN"`, `quantity_change: +1`). |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent requests with 1-unit stock: 1 succeeded, 4 failed (HTTP 400). Stock = 0, no overselling. |
| **Edge 2) Transaction Atomicity** | ✅ PASS | Dropped `inventory_logs` table mid-operation → backend returned 500, stock unchanged (rollback verified). |
| **Edge 3) Overselling Attempt** | ✅ PASS | Request for more than available stock rejected with HTTP 400. Stock unchanged. |
| **Edge 4) Boundary Value** | ✅ PASS | `alert_triggered` correctly `false` at stock=6, `true` at stock=5 (= threshold), and `true` at stock=4. |

---

## 2. Test Output

```text
 PASS  ./inventory.test.js
  Inventory System Tests (IMAG01)
    ✓ Scenario 1: Successful Stock Deduction (161 ms)
    ✓ Scenario 2: Low Stock Alert Trigger (18 ms)
    ✓ Scenario 3: Stock Restoration (25 ms)
    ✓ Edge Case 1: Race Condition (57 ms)
    ✓ Edge Case 2: Transaction Atomicity (44 ms)
    ✓ Edge Case 3: Overselling Attempt (30 ms)
    ✓ Edge Case 4: Boundary Value of Low Stock (≤ threshold) (26 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.883 s
Ran all test suites.
```

---

## 3. Code Implementation Details

| Item | Value |
|---|---|
| **Language / Framework** | Python 3.11 + FastAPI + SQLAlchemy 2.x |
| **Database** | PostgreSQL 15 |
| **Backend port** | `8001` |
| **DB port (host)** | `5433` |
| **DB credentials** | `inventory_user / inventory_password / inventory_db` |
| **Concurrency lock** | `with_for_update()` (SQLAlchemy row-level lock) |
| **Low-stock alert** | Inline in buy response: `alert_triggered: true/false` (stock ≤ threshold) |
| **Insufficient stock** | HTTP 400 `{ detail: "Insufficient Stock" }` |
| **Transaction strategy** | SQLAlchemy session; `db.rollback()` in `except` block |
| **Test framework** | Jest 29 + axios + pg (integration against live Docker containers) |

### Key API Endpoints

| Method | Path | Body | Success Response |
|---|---|---|---|
| `POST` | `/api/buy` | `{ sku, quantity }` | `200 { status, message, remaining_stock, alert_triggered }` |
| `POST` | `/api/cancel` | `{ sku, quantity }` | `200 { status, message, remaining_stock }` |
| `GET` | `/api/products` | — | `200 [ { id, sku, name, stock, low_stock_threshold } ]` |
| `GET` | `/api/logs` | — | `200 [ { id, sku, type, quantity_change, timestamp } ]` |

### Database Schema

**`products`**
```
id                  SERIAL PRIMARY KEY
sku                 TEXT UNIQUE NOT NULL
name                TEXT NOT NULL
stock               INTEGER NOT NULL DEFAULT 0
low_stock_threshold INTEGER NOT NULL DEFAULT 5
```

**`inventory_logs`**
```
id              SERIAL PRIMARY KEY
sku             TEXT NOT NULL          -- string reference (no FK to products)
type            TEXT NOT NULL          -- "SALE" | "RESTOCK/RETURN"
quantity_change INTEGER NOT NULL       -- negative for sales, positive for restores
timestamp       TIMESTAMPTZ DEFAULT NOW()
```

---

## 4. Test Script (`tests/inventory.test.js`)

The Jest test file resets the database before each test case and verifies both the HTTP response and the database state directly via a `pg` pool connection.

```javascript
const axios = require("axios");
const { Pool } = require("pg");

const BASE_URL = "http://localhost:8001";
const api = axios.create({ baseURL: BASE_URL, validateStatus: () => true });
const pool = new Pool({ host: "127.0.0.1", port: 5433,
  user: "inventory_user", password: "inventory_password", database: "inventory_db" });

beforeEach(async () => {
  await pool.query("TRUNCATE inventory_logs CASCADE");
  await pool.query("DELETE FROM products");
  await pool.query(`
    INSERT INTO products (id, sku, name, stock, low_stock_threshold) VALUES
    (1,'SKU-001','Product A',10,5),(2,'SKU-002','Product B',6,5),
    (3,'SKU-003','Product C',5,5),(4,'SKU-004','Product D',1,5),
    (5,'SKU-005','Product E',5,5),(6,'SKU-006','Product F',7,5)
  `);
});

// Scenario 1: POST /api/buy {sku:"SKU-001",quantity:2} → 200, remaining_stock=8
// Scenario 2: POST /api/buy {sku:"SKU-002",quantity:2} → alert_triggered=true
// Scenario 3: POST /api/cancel {sku:"SKU-003",quantity:1} → remaining_stock=6
// Edge 1: 5× concurrent buy SKU-004 qty=1 → 1 OK, 4 fail (400), stock=0
// Edge 2: DROP TABLE inventory_logs → buy → 500, stock unchanged
// Edge 3: buy SKU-005 qty=6 → 400, stock=5
// Edge 4: buy SKU-006 qty=1 ×3 → alert false→true→true
```

---

## 5. Key Differences vs IMCS01

| Aspect | IMCS01 (FastAPI/Python) | IMAG01 (FastAPI/Python — AI-generated) |
|---|---|---|
| **Architecture** | Uses separate `alerts` table for low-stock events | Alert returned inline (`alert_triggered` field in buy response) |
| **Log `type` field** | `"SALE"` / `"RESTOCK/RETURN"` | Same: `"SALE"` / `"RESTOCK/RETURN"` |
| **Log amount field** | `delta` (signed int) | `quantity_change` (signed int) |
| **Alert persistence** | Separate `alerts` table (kind: `LOW_STOCK`) | Not persisted — returned in response only |
| **DB port** | 5432 | 5433 |
| **Seed data** | Seeded by FastAPI startup event | Seeded by FastAPI startup event; tests reset via direct SQL |
| **Test file location** | `tests/inventory.test.js` | `tests/inventory.test.js` |
| **Test approach** | `axios` + `pg` (integration against Docker) | Same: `axios` + `pg` (integration against Docker) |
