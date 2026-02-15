import request from "supertest";
import { app } from "../src/server.js";
import { pool } from "../src/db.js";

describe("Shopping Cart Scenarios", () => {
  beforeAll(async () => {
    // Ensure connection
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Reset DB
    await pool.query("TRUNCATE cart_items, carts, products RESTART IDENTITY CASCADE");
    // Seed products
    // Scenario 1: Product A (SKU-001) 100.00 (10000 cents)
    // Scenario 3: SKU-005
    // Edge 2: 19.99 (1999 cents)
    await pool.query(`
      INSERT INTO products (id, sku, name, price_cents, stock) VALUES
      (1, 'SKU-001', 'Product A', 10000, 10),
      (2, 'SKU-002', 'Product B', 2000, 5),
      (3, 'SKU-003', 'Product C', 3000, 5),
      (4, 'SKU-004', 'Product D', 4000, 1),
      (5, 'SKU-005', 'Product E', 5000, 5),
      (6, 'SKU-006', 'Product F', 1999, 100)
    `);
    // Create demo cart
    await pool.query("INSERT INTO carts (id) VALUES (1)");
  });

  test("Scenario 1: Update Item Quantity", async () => {
    // Given: Cart has Product A (100.00) x 1
    await request(app).post("/api/cart/items").send({ productId: 1, qty: 1 }).expect(200);

    // When: Update quantity to 3
    const res = await request(app).patch("/api/cart/items/1").send({ qty: 3 }).expect(200);

    // Then:
    // 1) Quantity is 3
    const item = res.body.items.find(i => i.product_id === 1);
    expect(item.qty).toBe(3);
    // 2) Line Total (implied by unit_price * qty)
    // 3) Grand Total
    // 3 * 10000 = 30000 cents
    expect(res.body.totals.subtotal_cents).toBe(30000);
    expect(res.body.totals.item_count).toBe(3);
  });

  test("Scenario 2: Merge Items Logic", async () => {
    // Given: Cart has SKU-001 x 1
    await request(app).post("/api/cart/items").send({ productId: 1, qty: 1 }).expect(200);

    // When: Add SKU-001 x 2 again
    const res = await request(app).post("/api/cart/items").send({ productId: 1, qty: 2 }).expect(200);

    // Then:
    // 1) No duplicate rows (checked by finding item)
    const items = res.body.items.filter(i => i.product_id === 1);
    expect(items.length).toBe(1);
    // 2) Quantity merged (1 + 2 = 3)
    expect(items[0].qty).toBe(3);
    // 3) Stock check (implicit, if it exceeded stock it would fail, tested in Edge 1)
  });

  test("Scenario 3: Save for Later", async () => {
    // Given: SKU-005 in cart
    await request(app).post("/api/cart/items").send({ productId: 5, qty: 1 }).expect(200);

    // When: Save for Later
    const res = await request(app).post("/api/cart/items/5/save").send({ saved: true }).expect(200);

    // Then:
    // 1) Removed from active cart
    const activeItem = res.body.items.find(i => i.product_id === 5);
    expect(activeItem).toBeUndefined();
    // 2) Total reduced (should be 0 as it was the only item)
    expect(res.body.totals.subtotal_cents).toBe(0);
    // 3) Moved to Saved Items
    const savedItem = res.body.savedForLater.find(i => i.product_id === 5);
    expect(savedItem).toBeDefined();
    expect(savedItem.qty).toBe(1);
  });

  test("Edge Case 1: Add More Than Stock", async () => {
    // Context: Stock is 5 (SKU-005).
    // Test: Cart has 3. Try to add 3 more (Total 6).
    
    // 1. Add 3
    await request(app).post("/api/cart/items").send({ productId: 5, qty: 3 }).expect(200);

    // 2. Try to add 3 more
    const res = await request(app).post("/api/cart/items").send({ productId: 5, qty: 3 });
    
    // Expect failure
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Not enough stock/);

    // Check cart remains at 3
    const cartRes = await request(app).get("/api/cart").expect(200);
    const item = cartRes.body.items.find(i => i.product_id === 5);
    expect(item.qty).toBe(3);
  });

  test("Edge Case 2: Floating Point Calculation", async () => {
    // Context: Product F (SKU-006) is 19.99 (1999 cents)
    // Test: Add 3 items. 19.99 * 3 = 59.97 (5997 cents)
    
    const res = await request(app).post("/api/cart/items").send({ productId: 6, qty: 3 }).expect(200);

    // Expect 5997 cents
    expect(res.body.totals.subtotal_cents).toBe(5997);
    
    // If we were to display it, it would be 59.97.
    // The backend handles cents, so floating point issues are avoided by design.
    // We verify the cents integer is correct.
  });
});
