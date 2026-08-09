process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'inventory';

const request = require('supertest');
const { app, pool } = require('./test-app');

// Every assertion below maps directly to an "Expected Result" bullet in
// scenarios_inventory.md. A requirement that the system does not implement is
// asserted anyway and therefore fails, matching the grading rule applied to
// every other version.

async function inventoryLogCount(where, params) {
  // The scenarios require an InventoryLog entry. If the table does not exist,
  // the requirement is unmet.
  const { rows } = await pool.query(
    `SELECT to_regclass('public.inventory_log') IS NOT NULL AS present`
  );
  if (!rows[0].present) return null;
  const r = await pool.query(`SELECT count(*)::int AS c FROM inventory_log WHERE ${where}`, params);
  return r.rows[0].c;
}

async function lowStockAlertExists(productId) {
  // The scenarios require an alert record or event once stock <= threshold.
  // No alert surface at all means no alert was raised.
  const { rows } = await pool.query(
    `SELECT to_regclass('public.low_stock_alerts') IS NOT NULL AS present`
  );
  if (!rows[0].present) return false;
  const r = await pool.query(
    'SELECT count(*)::int AS c FROM low_stock_alerts WHERE product_id = $1',
    [productId]
  );
  return r.rows[0].c > 0;
}

describe('Inventory System Tests (IMCE02)', () => {
  beforeAll(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        stock INTEGER NOT NULL CHECK (stock >= 0)
      );
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM products');
    await pool.query("SELECT setval('products_id_seq', 1, false)");
    await pool.query(`
      INSERT INTO products (id, name, stock) VALUES
      (1, 'SKU-001', 10),
      (2, 'SKU-002', 6),
      (3, 'SKU-003', 5),
      (4, 'SKU-004', 1),
      (5, 'SKU-005', 5),
      (6, 'SKU-006', 7)
    `);
  });

  // ─── Acceptance Scenarios ─────────────────────────────────────────────────

  test('Scenario 1: Successful Stock Deduction', async () => {
    // SKU-001 (id=1): stock=10, deduct 2 → stock=8
    await request(app).post('/api/stock/deduct/1').expect(200);
    await request(app).post('/api/stock/deduct/1').expect(200);

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=1');
    expect(rows[0].stock).toBe(8);

    // Expected Result 2: InventoryLog entry of type SALE with quantity -2
    const logged = await inventoryLogCount(
      "product_id = $1 AND type = 'SALE'",
      [1]
    );
    expect(logged).toBe(1);
  });

  test('Scenario 2: Low Stock Alert Trigger', async () => {
    // SKU-002 (id=2): stock=6, threshold=5, deduct 2 → stock=4
    await request(app).post('/api/stock/deduct/2').expect(200);
    await request(app).post('/api/stock/deduct/2').expect(200);

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=2');
    expect(rows[0].stock).toBe(4);

    // Expected Result 2: alert record / event once 4 <= 5
    expect(await lowStockAlertExists(2)).toBe(true);
  });

  test('Scenario 3: Stock Restoration', async () => {
    // SKU-003 (id=3): stock=5, restore 1 → stock=6
    const res = await request(app).post('/api/stock/restore/3').expect(200);
    expect(res.body.message).toBe('Stock restored');

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=3');
    expect(rows[0].stock).toBe(6);

    // Expected Result 2: InventoryLog entry of type RESTOCK/RETURN with +1
    const logged = await inventoryLogCount(
      "product_id = $1 AND type = 'RESTOCK/RETURN'",
      [3]
    );
    expect(logged).toBe(1);
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test('Edge Case 1: Race Condition — only 1 of 5 concurrent requests should succeed', async () => {
    // SKU-004 (id=4): stock=1, fire 5 concurrent deduct requests
    const requests = Array(5).fill(null).map(() =>
      request(app).post('/api/stock/deduct/4')
    );
    const results = await Promise.all(requests);

    const successCount = results.filter(r => r.status === 200).length;
    const failCount = results.filter(r => r.status === 400).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(4);

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=4');
    expect(rows[0].stock).toBe(0);
  });

  test('Edge Case 2: Transaction Atomicity — stock deduction and log must be all-or-nothing', async () => {
    // The scenario requires the stock update and the InventoryLog write to sit
    // inside one transaction: if the log write fails, stock must roll back.
    // First the paired write has to exist at all.
    await request(app).post('/api/stock/deduct/1').expect(200);
    const logged = await inventoryLogCount('product_id = $1', [1]);
    expect(logged).toBe(1);

    // Then force the log write to fail and require the stock update to roll back.
    await pool.query('UPDATE products SET stock = 10 WHERE id = 1');
    await pool.query('DROP TABLE IF EXISTS inventory_log CASCADE');
    const res = await request(app).post('/api/stock/deduct/1');
    expect(res.status).toBe(400);

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=1');
    expect(rows[0].stock).toBe(10);
  });

  test('Edge Case 3: Overselling Attempt — single order of 6 against stock 5 must be rejected', async () => {
    // SKU-005 (id=5): stock=5. Scenario: one order for 6 units at once.
    const res = await request(app)
      .post('/api/stock/deduct/5')
      .send({ quantity: 6 });

    expect(res.status).toBe(400);

    // Stock must be untouched — no deduct-then-restore.
    const { rows } = await pool.query('SELECT stock FROM products WHERE id=5');
    expect(rows[0].stock).toBe(5);
  });

  test('Edge Case 4: Boundary Value — low stock alert at threshold <= 5', async () => {
    // SKU-006 (id=6): stock=7, threshold=5
    await request(app).post('/api/stock/deduct/6').expect(200); // 7 → 6
    let { rows } = await pool.query('SELECT stock FROM products WHERE id=6');
    expect(rows[0].stock).toBe(6);
    expect(await lowStockAlertExists(6)).toBe(false);

    await request(app).post('/api/stock/deduct/6').expect(200); // 6 → 5
    ({ rows } = await pool.query('SELECT stock FROM products WHERE id=6'));
    expect(rows[0].stock).toBe(5);
    expect(await lowStockAlertExists(6)).toBe(true);

    await request(app).post('/api/stock/deduct/6').expect(200); // 5 → 4
    ({ rows } = await pool.query('SELECT stock FROM products WHERE id=6'));
    expect(rows[0].stock).toBe(4);
    expect(await lowStockAlertExists(6)).toBe(true);
  });
});
