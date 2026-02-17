const request = require("supertest");
const { app } = require("../server");
const { pool } = require("../db");

describe("Shopping Cart Scenarios v7", () => {
  beforeAll(async () => {
    // Ensure connection
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    const client = await pool.connect();
    try {
      await client.query("TRUNCATE cart_items, products RESTART IDENTITY CASCADE");
      // Seed products
      // Scenario 1: Product A (SKU-001) 100.00 (10000 cents)
      // Scenario 3: SKU-005
      // Edge 2: 19.99 (1999 cents)
      await client.query(`
        INSERT INTO products (sku, name, price_cents, stock) VALUES
        ('SKU-001', 'Product A', 10000, 10),
        ('SKU-002', 'Product B', 2000, 5),
        ('SKU-003', 'Product C', 3000, 5),
        ('SKU-004', 'Product D', 4000, 1),
        ('SKU-005', 'Product E', 5000, 5),
        ('SKU-006', 'Product F', 1999, 100)
      `);
      // No carts table in v7, uses fixed DEMO_CART_ID
    } finally {
      client.release();
    }
  });

  test("Scenario 1: Update Item Quantity", async () => {
    // Given: Cart has Product A (SKU-001) x 1
    await request(app).post("/api/cart/items").send({ sku: 'SKU-001', quantity: 1 }).expect(200);

    // When: Update quantity to 3
    const res = await request(app).patch("/api/cart/items/SKU-001").send({ quantity: 3 }).expect(200);

    // Then:
    // 1) Quantity is 3
    const item = res.body.cart.items.find(i => i.sku === 'SKU-001');
    expect(item.quantity).toBe(3);
    // 2) Grand Total
    // 3 * 10000 = 30000 cents
    expect(res.body.cart.totals.active_subtotal_cents).toBe(30000);
  });

  test("Scenario 2: Merge Items Logic", async () => {
    // Given: Cart has SKU-001 x 1
    await request(app).post("/api/cart/items").send({ sku: 'SKU-001', quantity: 1 }).expect(200);

    // When: Add SKU-001 x 2 again
    const res = await request(app).post("/api/cart/items").send({ sku: 'SKU-001', quantity: 2 }).expect(200);

    // Then:
    // 1) No duplicate rows (checked by filtering items)
    const items = res.body.cart.items.filter(i => i.sku === 'SKU-001');
    expect(items.length).toBe(1);
    // 2) Quantity merged (1 + 2 = 3)
    expect(items[0].quantity).toBe(3);
  });

  test("Scenario 3: Save for Later", async () => {
    // Given: SKU-005 in cart
    await request(app).post("/api/cart/items").send({ sku: 'SKU-005', quantity: 1 }).expect(200);

    // When: Save for Later
    // v7 uses /toggle-save to switch status
    const res = await request(app).post("/api/cart/items/SKU-005/toggle-save").send({ saved: true }).expect(200);

    // Then:
    // 1) Status should be SAVED
    const item = res.body.cart.items.find(i => i.sku === 'SKU-005');
    expect(item.status).toBe('SAVED');
    
    // 2) Total reduced (should be 0 as it was the only active item)
    expect(res.body.cart.totals.active_subtotal_cents).toBe(0);
    expect(res.body.cart.totals.saved_total_cents).toBe(5000);
  });

  test("Edge Case 1: Add More Than Stock", async () => {
    // Context: Stock is 5 (SKU-005).
    // Test: Cart has 3. Try to add 3 more (Total 6).
    
    // 1. Add 3
    await request(app).post("/api/cart/items").send({ sku: 'SKU-005', quantity: 3 }).expect(200);

    // 2. Try to add 3 more
    const res = await request(app).post("/api/cart/items").send({ sku: 'SKU-005', quantity: 3 });
    
    // Expect failure
    expect(res.status).toBe(409);
    // v7 returns { ok: false, code: "INSUFFICIENT_STOCK", ... }
    expect(res.body.code).toBe("INSUFFICIENT_STOCK");

    // Check cart remains at 3
    const cartRes = await request(app).get("/api/cart").expect(200);
    const item = cartRes.body.cart.items.find(i => i.sku === 'SKU-005');
    expect(item.quantity).toBe(3);
  });

  test("Edge Case 2: Floating Point Calculation", async () => {
    // Context: Product F (SKU-006) is 19.99 (1999 cents)
    // Test: Add 3 items. 19.99 * 3 = 59.97 (5997 cents)
    
    const res = await request(app).post("/api/cart/items").send({ sku: 'SKU-006', quantity: 3 }).expect(200);

    // Expect 5997 cents in active subtotal
    expect(res.body.cart.totals.active_subtotal_cents).toBe(5997);
  });
});
