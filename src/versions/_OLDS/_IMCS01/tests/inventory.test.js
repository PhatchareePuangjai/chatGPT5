/**
 * Integration tests for IMCS01 — Inventory Management (FastAPI backend)
 * Clone/adapted from IMCE01/inventory-system/backend/tests/inventory.test.js
 *
 * Backend runs at http://localhost:8000 (docker compose up --build from IMCS01/)
 * DB exposed at localhost:5432  user/pass/db = inventory/inventory/inventory
 */

const axios = require("axios");
const { Pool } = require("pg");

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = process.env.API_URL || "http://localhost:8000";

// axios instance that never throws on HTTP error status
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
  timeout: 10000,
});

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "inventory",
  password: process.env.DB_PASSWORD || "inventory",
  database: process.env.DB_NAME || "inventory",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(64) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      low_stock_threshold INTEGER DEFAULT 5,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      type VARCHAR(64) NOT NULL,
      delta INTEGER NOT NULL,
      note VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      kind VARCHAR(64) NOT NULL,
      message VARCHAR(500) NOT NULL,
      resolved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function resetDB() {
  await ensureTables();
  await pool.query("DELETE FROM alerts");
  await pool.query("DELETE FROM inventory_logs");
  await pool.query("DELETE FROM products");

  // Seed products via API so FastAPI manages its own ORM/session state
  const seeds = [
    { sku: "SKU-001", name: "Product 1", quantity: 10, low_stock_threshold: 5 },
    { sku: "SKU-002", name: "Product 2", quantity: 6,  low_stock_threshold: 5 },
    { sku: "SKU-003", name: "Product 3", quantity: 5,  low_stock_threshold: 5 },
    { sku: "SKU-004", name: "Product 4", quantity: 1,  low_stock_threshold: 5 },
    { sku: "SKU-005", name: "Product 5", quantity: 5,  low_stock_threshold: 5 },
    { sku: "SKU-006", name: "Product 6", quantity: 7,  low_stock_threshold: 5 },
  ];
  for (const s of seeds) {
    await api.post("/api/products", s);
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Inventory System Tests (IMCS01)", () => {
  beforeAll(async () => {
    // Verify backend is up
    const res = await api.get("/api/health");
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
    // SKU-001 starts at 10 → buy 2 → expect 8
    const res = await api.post("/api/purchase", { sku: "SKU-001", quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.data.quantity).toBe(8);

    // Verify in DB
    const { rows: prodRows } = await pool.query(
      "SELECT quantity FROM products WHERE sku = $1",
      ["SKU-001"]
    );
    expect(prodRows[0].quantity).toBe(8);

    // Verify InventoryLog: type="SALE", delta=-2
    const { rows: logRows } = await pool.query(
      `SELECT il.type, il.delta
       FROM inventory_logs il
       JOIN products p ON p.id = il.product_id
       WHERE p.sku = $1`,
      ["SKU-001"]
    );
    expect(logRows).toHaveLength(1);
    expect(logRows[0].type).toBe("SALE");
    expect(logRows[0].delta).toBe(-2);
  });

  test("Scenario 2: Low Stock Alert Trigger", async () => {
    // SKU-002 starts at 6, threshold=5 → buy 2 → left 4 (≤5) → alert
    const res = await api.post("/api/purchase", { sku: "SKU-002", quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.data.quantity).toBe(4);

    // Verify stock in DB
    const { rows: prodRows } = await pool.query(
      "SELECT quantity FROM products WHERE sku = $1",
      ["SKU-002"]
    );
    expect(prodRows[0].quantity).toBe(4);

    // Verify Alert was created
    const alertRes = await api.get("/api/alerts");
    expect(alertRes.status).toBe(200);
    const sku2Alerts = alertRes.data.filter(
      (a) => a.kind === "LOW_STOCK"
    );
    expect(sku2Alerts.length).toBeGreaterThanOrEqual(1);
  });

  test("Scenario 3: Stock Restoration", async () => {
    // SKU-003 starts at 5 → restore 1 → expect 6
    const res = await api.post("/api/restore", { sku: "SKU-003", quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.data.quantity).toBe(6);

    // Verify in DB
    const { rows: prodRows } = await pool.query(
      "SELECT quantity FROM products WHERE sku = $1",
      ["SKU-003"]
    );
    expect(prodRows[0].quantity).toBe(6);

    // Verify InventoryLog: type="RESTOCK/RETURN", delta=+1
    const { rows: logRows } = await pool.query(
      `SELECT il.type, il.delta
       FROM inventory_logs il
       JOIN products p ON p.id = il.product_id
       WHERE p.sku = $1`,
      ["SKU-003"]
    );
    expect(logRows).toHaveLength(1);
    expect(logRows[0].type).toBe("RESTOCK/RETURN");
    expect(logRows[0].delta).toBe(1);
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────

  test("Edge Case 1: Race Condition", async () => {
    // SKU-004 has only 1 item. Fire 5 concurrent purchase requests.
    const requests = Array(5)
      .fill(null)
      .map(() => api.post("/api/purchase", { sku: "SKU-004", quantity: 1 }));

    const results = await Promise.all(requests);

    const successCount = results.filter((r) => r.status === 200).length;
    const failCount = results.filter((r) => r.status !== 200).length;

    // Exactly 1 should succeed; the rest must fail
    expect(successCount).toBe(1);
    expect(failCount).toBe(4);

    // Stock must be exactly 0 — no overselling
    const { rows } = await pool.query(
      "SELECT quantity FROM products WHERE sku = $1",
      ["SKU-004"]
    );
    expect(rows[0].quantity).toBe(0);
  });

  test("Edge Case 2: Transaction Atomicity", async () => {
    // Simulate mid-transaction failure by dropping the log table.
    // If the purchase is NOT wrapped in a transaction, stock would be deducted
    // even though the log insert fails → data inconsistency.
    // With a proper transaction the whole operation must ROLLBACK.
    await pool.query("DROP TABLE inventory_logs CASCADE");

    const res = await api.post("/api/purchase", { sku: "SKU-001", quantity: 1 });

    // Backend should return 500 (unhandled DB error)
    expect(res.status).toBe(500);

    // Stock must still be 10 — rollback happened
    const { rows } = await pool.query(
      "SELECT quantity FROM products WHERE sku = $1",
      ["SKU-001"]
    );
    expect(rows[0].quantity).toBe(10);
  });

  test("Edge Case 3: Overselling Attempt", async () => {
    // SKU-005 has 5. Attempt to buy 6 in one request.
    const res = await api.post("/api/purchase", { sku: "SKU-005", quantity: 6 });

    // Must be rejected immediately
    expect(res.status).toBe(400);

    // Stock must remain unchanged
    const { rows } = await pool.query(
      "SELECT quantity FROM products WHERE sku = $1",
      ["SKU-005"]
    );
    expect(rows[0].quantity).toBe(5);
  });

  test("Edge Case 4: Boundary Value of Low Stock (≤ threshold)", async () => {
    // SKU-006 starts at 7, threshold = 5
    // Step 1: 7 → 6 — still above threshold, no alert
    let res = await api.post("/api/purchase", { sku: "SKU-006", quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.data.quantity).toBe(6);

    let alertsRes = await api.get("/api/alerts");
    let sku6Alerts = alertsRes.data.filter((a) => a.kind === "LOW_STOCK");
    expect(sku6Alerts).toHaveLength(0); // no alert yet

    // Step 2: 6 → 5 — exactly at threshold → MUST alert
    res = await api.post("/api/purchase", { sku: "SKU-006", quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.data.quantity).toBe(5);

    alertsRes = await api.get("/api/alerts");
    sku6Alerts = alertsRes.data.filter((a) => a.kind === "LOW_STOCK");
    expect(sku6Alerts.length).toBeGreaterThanOrEqual(1); // alert triggered at 5

    // Step 3: 5 → 4 — below threshold → still alerts
    res = await api.post("/api/purchase", { sku: "SKU-006", quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.data.quantity).toBe(4);

    alertsRes = await api.get("/api/alerts");
    sku6Alerts = alertsRes.data.filter((a) => a.kind === "LOW_STOCK");
    expect(sku6Alerts.length).toBeGreaterThanOrEqual(2); // second alert at 4

    // Final DB check
    const { rows } = await pool.query(
      "SELECT quantity FROM products WHERE sku = $1",
      ["SKU-006"]
    );
    expect(rows[0].quantity).toBe(4);
  });
});
