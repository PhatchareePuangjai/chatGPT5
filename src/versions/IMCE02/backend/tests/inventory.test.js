process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'inventory';

const request = require('supertest');
const { app, pool } = require('./test-app');

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
    // SKU-001 (id=1): stock=10, deduct 2 times → stock should be 8
    // IMCE02 API deducts 1 per call (no quantity param), so 2 calls = deduct 2
    const res1 = await request(app).post('/api/stock/deduct/1').expect(200);
    const res2 = await request(app).post('/api/stock/deduct/1').expect(200);

    expect(res1.body.message).toBe('Stock deducted successfully');
    expect(res2.body.message).toBe('Stock deducted successfully');

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=1');
    expect(rows[0].stock).toBe(8);

    // InventoryLog 'SALE' with quantity_delta=-2: NOT IMPLEMENTED
    // IMCE02 has no inventory_log table
  });

  test('Scenario 2: Low Stock Alert Trigger', async () => {
    // SKU-002 (id=2): stock=6, threshold=5, deduct 2 → stock=4 (should trigger alert)
    await request(app).post('/api/stock/deduct/2').expect(200);
    await request(app).post('/api/stock/deduct/2').expect(200);

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=2');
    expect(rows[0].stock).toBe(4);

    // Low Stock Alert: NOT IMPLEMENTED
    // IMCE02 has no low_stock_threshold column and no alert mechanism
    // Expected: alert record created when stock ≤ 5
  });

  test('Scenario 3: Stock Restoration', async () => {
    // SKU-003 (id=3): stock=5, restore 1 → stock should be 6
    const res = await request(app).post('/api/stock/restore/3').expect(200);

    expect(res.body.message).toBe('Stock restored');

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=3');
    expect(rows[0].stock).toBe(6);

    // InventoryLog 'RESTOCK/RETURN' with quantity_delta=+1: NOT IMPLEMENTED
    // IMCE02 has no inventory_log table
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test('Edge Case 1: Race Condition — only 1 of 5 concurrent requests should succeed', async () => {
    // SKU-004 (id=4): stock=1, fire 5 concurrent deduct requests
    // IMCE02 uses SELECT FOR UPDATE → only 1 should succeed
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

  test('Edge Case 2: Transaction Atomicity — rollback on error', async () => {
    // Deduct on non-existent product must return 400 and not corrupt DB state
    const res = await request(app).post('/api/stock/deduct/9999');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Product not found');

    // Full atomicity (stock deduct + inventory_log in one transaction): NOT TESTABLE
    // IMCE02 has no inventory_log table, so the paired-write atomicity cannot be verified
  });

  test('Edge Case 3: Overselling Attempt — stock cannot go negative', async () => {
    // SKU-005 (id=5): stock=5
    // Scenario: "order 6 at once" — adapted to 6 sequential calls since API has no quantity param
    // First 5 calls succeed, 6th must fail
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/stock/deduct/5').expect(200);
    }

    const res = await request(app).post('/api/stock/deduct/5');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Out of stock');

    const { rows } = await pool.query('SELECT stock FROM products WHERE id=5');
    expect(rows[0].stock).toBe(0);
  });

  test('Edge Case 4: Boundary Value — low stock alert at threshold ≤ 5', async () => {
    // SKU-006 (id=6): stock=7, threshold=5 (not configurable in IMCE02)
    // Only stock changes are verifiable; alert behavior is not implemented

    await request(app).post('/api/stock/deduct/6').expect(200); // 7 → 6
    let { rows } = await pool.query('SELECT stock FROM products WHERE id=6');
    expect(rows[0].stock).toBe(6); // No alert expected (6 > 5)

    await request(app).post('/api/stock/deduct/6').expect(200); // 6 → 5
    ({ rows } = await pool.query('SELECT stock FROM products WHERE id=6'));
    expect(rows[0].stock).toBe(5); // Alert SHOULD trigger (5 ≤ 5) — NOT IMPLEMENTED

    await request(app).post('/api/stock/deduct/6').expect(200); // 5 → 4
    ({ rows } = await pool.query('SELECT stock FROM products WHERE id=6'));
    expect(rows[0].stock).toBe(4); // Alert SHOULD trigger (4 ≤ 5) — NOT IMPLEMENTED

    // Low stock boundary alert: NOT IMPLEMENTED in IMCE02
  });
});
