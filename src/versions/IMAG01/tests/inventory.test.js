/**
 * Integration tests for IMAG01 — Inventory Management (FastAPI backend)
 * Clone/adapted from IMBP01/online-shop-inventory/backend/tests/inventory.test.js
 *
 * Backend runs at http://localhost:8001 (docker compose up --build from IMAG01/)
 * DB exposed at   127.0.0.1:5433  user/pass/db = inventory_user/inventory_password/inventory_db
 *
 * API endpoints:
 *   POST /api/buy     { sku, quantity }  → buy/deduct stock
 *   POST /api/cancel  { sku, quantity }  → restore/return stock
 *   GET  /api/products
 *   GET  /api/logs
 */

const axios = require("axios");
const { Pool } = require("pg");

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = process.env.API_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
  timeout: 10000,
});

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "5433"),
  user: process.env.DB_USER || "inventory_user",
  password: process.env.DB_PASSWORD || "inventory_password",
  database: process.env.DB_NAME || "inventory_db",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id                 SERIAL PRIMARY KEY,
      sku                TEXT UNIQUE NOT NULL,
      name               TEXT NOT NULL,
      stock              INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id              SERIAL PRIMARY KEY,
      sku             TEXT NOT NULL,
      type            TEXT NOT NULL,
      quantity_change INTEGER NOT NULL,
      timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function resetDB() {
  await ensureTables();
  await pool.query("TRUNCATE inventory_logs CASCADE");
  await pool.query("DELETE FROM products");

  // Seed products matching all scenario requirements
  await pool.query(`
    INSERT INTO products (id, sku, name, stock, low_stock_threshold) VALUES
    (1, 'SKU-001', 'Product A', 10, 5),
    (2, 'SKU-002', 'Product B', 6,  5),
    (3, 'SKU-003', 'Product C', 5,  5),
    (4, 'SKU-004', 'Product D', 1,  5),
    (5, 'SKU-005', 'Product E', 5,  5),
    (6, 'SKU-006', 'Product F', 7,  5)
  `);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Inventory System Tests (IMAG01)", () => {
  beforeAll(async () => {
    const res = await api.get("/api/products");
    if (res.status !== 200) throw new Error("Backend is not reachable at " + BASE_URL);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await resetDB();
  });

  // ── Acceptance Scenarios ──────────────────────────────────────────────────

  test("Scenario 1: Successful Stock Deduction", async () => {
    // SKU-001 starts at 10. Buy 2. Expect 8.
    const res = await api.post("/api/buy", { sku: "SKU-001", quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.data.status).toBe("Success");
    expect(res.data.remaining_stock).toBe(8);

    // Verify stock in DB
    const { rows: prodRows } = await pool.query(
      "SELECT stock FROM products WHERE sku = $1",
      ["SKU-001"]
    );
    expect(prodRows[0].stock).toBe(8);

    // Verify InventoryLog: type="SALE", quantity_change=-2
    const { rows: logRows } = await pool.query(
      "SELECT type, quantity_change FROM inventory_logs WHERE sku = $1",
      ["SKU-001"]
    );
    expect(logRows).toHaveLength(1);
    expect(logRows[0].type).toBe("SALE");
    expect(logRows[0].quantity_change).toBe(-2);
  });

  test("Scenario 2: Low Stock Alert Trigger", async () => {
    // SKU-002 starts at 6, threshold=5. Buy 2 → left 4 (≤5) → alert triggered.
    const res = await api.post("/api/buy", { sku: "SKU-002", quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.data.remaining_stock).toBe(4);

    // System must flag alert_triggered = true when stock ≤ threshold
    expect(res.data.alert_triggered).toBe(true);

    // Verify stock in DB
    const { rows } = await pool.query(
      "SELECT stock FROM products WHERE sku = $1",
      ["SKU-002"]
    );
    expect(rows[0].stock).toBe(4);
  });

  test("Scenario 3: Stock Restoration", async () => {
    // SKU-003 starts at 5. Cancel/restore 1 → expect 6.
    const res = await api.post("/api/cancel", { sku: "SKU-003", quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.data.status).toBe("Success");
    expect(res.data.remaining_stock).toBe(6);

    // Verify stock in DB
    const { rows: prodRows } = await pool.query(
      "SELECT stock FROM products WHERE sku = $1",
      ["SKU-003"]
    );
    expect(prodRows[0].stock).toBe(6);

    // Verify InventoryLog: type="RESTOCK/RETURN", quantity_change=+1
    const { rows: logRows } = await pool.query(
      "SELECT type, quantity_change FROM inventory_logs WHERE sku = $1",
      ["SKU-003"]
    );
    expect(logRows).toHaveLength(1);
    expect(logRows[0].type).toBe("RESTOCK/RETURN");
    expect(logRows[0].quantity_change).toBe(1);
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────

  test("Edge Case 1: Race Condition", async () => {
    // SKU-004 has only 1 item. Fire 5 concurrent buy requests.
    const requests = Array(5)
      .fill(null)
      .map(() => api.post("/api/buy", { sku: "SKU-004", quantity: 1 }));

    const results = await Promise.all(requests);

    const successCount = results.filter((r) => r.status === 200).length;
    const failCount    = results.filter((r) => r.status !== 200).length;

    // Exactly 1 must succeed; other 4 must fail
    expect(successCount).toBe(1);
    expect(failCount).toBe(4);

    // Stock must be exactly 0 — no overselling
    const { rows } = await pool.query(
      "SELECT stock FROM products WHERE sku = $1",
      ["SKU-004"]
    );
    expect(rows[0].stock).toBe(0);
  });

  test("Edge Case 2: Transaction Atomicity", async () => {
    // Simulate mid-transaction failure by dropping the inventory_logs table.
    // The buy handler adds a log entry inside the same SQLAlchemy session as
    // the stock deduction. If the commit fails, both writes must be rolled back.
    await pool.query("DROP TABLE inventory_logs CASCADE");

    const res = await api.post("/api/buy", { sku: "SKU-001", quantity: 1 });

    // Backend must return 500 (unhandled DB error)
    expect(res.status).toBe(500);

    // Stock must still be 10 — rollback happened
    const { rows } = await pool.query(
      "SELECT stock FROM products WHERE sku = $1",
      ["SKU-001"]
    );
    expect(rows[0].stock).toBe(10);
  });

  test("Edge Case 3: Overselling Attempt", async () => {
    // SKU-005 has 5. Attempt to buy 6 in one request.
    const res = await api.post("/api/buy", { sku: "SKU-005", quantity: 6 });

    // Must be rejected (400 Insufficient Stock)
    expect(res.status).toBe(400);

    // Stock must remain unchanged
    const { rows } = await pool.query(
      "SELECT stock FROM products WHERE sku = $1",
      ["SKU-005"]
    );
    expect(rows[0].stock).toBe(5);
  });

  test("Edge Case 4: Boundary Value of Low Stock (≤ threshold)", async () => {
    // SKU-006 starts at 7, threshold = 5
    // Step 1: 7 → 6 — above threshold, NO alert
    let res = await api.post("/api/buy", { sku: "SKU-006", quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.data.remaining_stock).toBe(6);
    expect(res.data.alert_triggered).toBe(false);

    // Step 2: 6 → 5 — exactly at threshold → MUST alert
    res = await api.post("/api/buy", { sku: "SKU-006", quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.data.remaining_stock).toBe(5);
    expect(res.data.alert_triggered).toBe(true);

    // Step 3: 5 → 4 — below threshold → still alert
    res = await api.post("/api/buy", { sku: "SKU-006", quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.data.remaining_stock).toBe(4);
    expect(res.data.alert_triggered).toBe(true);

    // Final DB check
    const { rows } = await pool.query(
      "SELECT stock FROM products WHERE sku = $1",
      ["SKU-006"]
    );
    expect(rows[0].stock).toBe(4);
  });
});
