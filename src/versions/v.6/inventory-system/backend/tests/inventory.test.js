// Set env vars before requiring app/db
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_USER = process.env.DB_USER || "postgres";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
process.env.DB_NAME = process.env.DB_NAME || "inventory";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.LOW_STOCK_THRESHOLD = process.env.LOW_STOCK_THRESHOLD || "5";

const request = require("supertest");
const app = require("../app");
const { pool } = require("../db");

// Ensure we connect to localhost for tests running on host
// Adjust if needed based on your environment setup
// process.env.DATABASE_URL is not used by v.6 db.js, but keeping it for reference if needed
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/inventory";

describe("Inventory System Tests (v.6)", () => {
  beforeAll(async () => {
    // Ensure tables exist matching v.6 app.js usage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 5,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS inventory_log (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Ensure tables exist (in case a test dropped them)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 5,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS inventory_log (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Reset DB state
    await pool.query("TRUNCATE inventory_log CASCADE");
    await pool.query("DELETE FROM products");
    
    // Insert initial data based on scenarios_inventory.md
    await pool.query(`
      INSERT INTO products (id, sku, name, stock, low_stock_threshold) VALUES
      (1, 'SKU-001', 'Product 1', 10, 5),
      (2, 'SKU-002', 'Product 2', 6, 5),
      (3, 'SKU-003', 'Product 3', 5, 5),
      (4, 'SKU-004', 'Product 4', 1, 5),
      (5, 'SKU-005', 'Product 5', 5, 5),
      (6, 'SKU-006', 'Product 6', 7, 5);
    `);
    // Reset sequence if needed
  });

  test("Scenario 1: Successful Stock Deduction", async () => {
    // SKU-001 has 10. Buy 2.
    const res = await request(app)
      .post("/api/purchase")
      .send({ productId: 1, quantity: 2 })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.remainingStock).toBe(8);

    // Check DB
    const { rows } = await pool.query("SELECT stock FROM products WHERE id=1");
    expect(rows[0].stock).toBe(8);

    // Check Log
    // MD says "SALE" and "-2". App stores "SALE" and "2".
    const logRes = await pool.query(
      "SELECT count(*) FROM inventory_log WHERE product_id=1 AND type='SALE' AND quantity=2"
    );
    expect(logRes.rows[0].count).toBe("1");
  });

  test("Scenario 2: Low Stock Alert Trigger", async () => {
    // SKU-002 has 6. Threshold 5. Buy 2 -> 4.
    const res = await request(app)
      .post("/api/purchase")
      .send({ productId: 2, quantity: 2 })
      .expect(200);

    expect(res.body.lowStockAlertTriggered).toBe(true);

    const { rows } = await pool.query("SELECT stock FROM products WHERE id=2");
    expect(rows[0].stock).toBe(4);

    // Check Alert Log
    const logRes = await pool.query(
      "SELECT count(*) FROM inventory_log WHERE product_id=2 AND type='LOW_STOCK_ALERT'"
    );
    expect(logRes.rows[0].count).toBe("1");
  });

  test("Scenario 3: Stock Restoration", async () => {
    // SKU-003 has 5. Restore 1.
    const res = await request(app)
      .post("/api/restore")
      .send({ productId: 3, quantity: 1 })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.newStock).toBe(6);

    const { rows } = await pool.query("SELECT stock FROM products WHERE id=3");
    expect(rows[0].stock).toBe(6);

    // Check Log
    const logRes = await pool.query(
      "SELECT count(*) FROM inventory_log WHERE product_id=3 AND type='RESTOCK/RETURN' AND quantity=1"
    );
    expect(logRes.rows[0].count).toBe("1");
  });

  test("Edge Case 1: Race Condition", async () => {
    // SKU-004 has 1. 5 concurrent requests for 1.
    const requests = Array(5).fill().map(() => 
      request(app).post("/api/purchase").send({ productId: 4, quantity: 1 })
    );

    const results = await Promise.all(requests);

    const successCount = results.filter(r => r.status === 200).length;
    const failCount = results.filter(r => r.status === 409).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(4);

    const { rows } = await pool.query("SELECT stock FROM products WHERE id=4");
    expect(rows[0].stock).toBe(0);
  });

  test("Edge Case 2: Transaction Atomicity", async () => {
    // Simulate a DB error during transaction by dropping the log table
    // The purchase logic updates product stock THEN inserts into log.
    
    await pool.query("DROP TABLE inventory_log CASCADE");

    // Try to buy 1 of SKU-001 (Stock 10)
    const res = await request(app)
      .post("/api/purchase")
      .send({ productId: 1, quantity: 1 });

    // Should fail with 500 because table is missing
    expect(res.status).toBe(500);

    // Verify stock is still 10 (Rollback successful)
    const { rows } = await pool.query("SELECT stock FROM products WHERE id=1");
    expect(rows[0].stock).toBe(10);
  });

  test("Edge Case 3: Overselling Attempt", async () => {
    // SKU-005 has 5. Buy 6.
    const res = await request(app)
      .post("/api/purchase")
      .send({ productId: 5, quantity: 6 });

    expect(res.status).toBe(409);
    
    const { rows } = await pool.query("SELECT stock FROM products WHERE id=5");
    expect(rows[0].stock).toBe(5);
  });

  test("Edge Case 4: Boundary Value", async () => {
    // SKU-006 has 7. Threshold 5.
    
    // 7 -> 6 (No alert)
    let res = await request(app).post("/api/purchase").send({ productId: 6, quantity: 1 }).expect(200);
    expect(res.body.lowStockAlertTriggered).toBe(false);
    
    // 6 -> 5 (Alert)
    res = await request(app).post("/api/purchase").send({ productId: 6, quantity: 1 }).expect(200);
    expect(res.body.lowStockAlertTriggered).toBe(true);
    
    // 5 -> 4 (Alert)
    res = await request(app).post("/api/purchase").send({ productId: 6, quantity: 1 }).expect(200);
    expect(res.body.lowStockAlertTriggered).toBe(true);

    const { rows } = await pool.query("SELECT stock FROM products WHERE id=6");
    expect(rows[0].stock).toBe(4);
  });
});
