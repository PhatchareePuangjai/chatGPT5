const request = require("supertest");
const { app } = require("../src/server");
const { pool, query } = require("../src/db");

describe("Promotions and Discounts Scenarios", () => {
  beforeAll(async () => {
    // Ensure DB is ready
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Reset DB
    await query("TRUNCATE coupon_usage, products RESTART IDENTITY CASCADE");
    // Seed products
    // A: 100.00 (10000 satang)
    // B: 250.00 (25000 satang)
    // C: 50.00 (5000 satang)
    // D: 750.00 (75000 satang)
    await query(`
      INSERT INTO products (id, name, price_satang, stock) VALUES
      ('A', 'Item A', 10000, 100),
      ('B', 'Item B', 25000, 100),
      ('C', 'Item C',  5000, 100),
      ('D', 'Item D', 75000, 100)
    `);
  });

  // Scenario 1: Coupon Validation
  test("1) Coupon Validation: Min purchase 500, Save 100", async () => {
    // Given: Cart total 1000 (10x Item A). Coupon "SAVE100".
    // Auto discount should be 0 for this scenario to match "Total becomes 900".
    
    const res = await request(app)
      .post("/api/checkout/quote")
      .set("x-auto-discount-percent", "0")
      .send({
        userId: "user1",
        items: [{ productId: "A", qty: 10 }], // 10 * 100 = 1000
        couponCode: "SAVE100"
      })
      .expect(200);

    // Then:
    // 1) Min condition met (1000 >= 500)
    expect(res.body.ok).toBe(true);
    // 2) Total reduces 100 (becomes 900)
    // Subtotal: 100000
    // Coupon: 10000
    // Total: 90000
    expect(res.body.pricing.subtotal_satang).toBe(100000);
    expect(res.body.pricing.coupon_discount_satang).toBe(10000);
    expect(res.body.pricing.total_satang).toBe(90000);
    // 3) Message "Success"
    expect(res.body.messages).toContain("Success");
  });

  // Scenario 2: Cart Total Discount %
  test("2) Cart Total Discount %: 10% off", async () => {
    // Given: Cart total 2000 (20x Item A). Promotion 10% off.
    
    const res = await request(app)
      .post("/api/checkout/quote")
      .set("x-auto-discount-percent", "10")
      .send({
        userId: "user1",
        items: [{ productId: "A", qty: 20 }], // 20 * 100 = 2000
        couponCode: null
      })
      .expect(200);

    // Then:
    // 1) Discount 200 (2000 * 10% = 200)
    // 2) Grand Total 1800
    expect(res.body.pricing.subtotal_satang).toBe(200000);
    expect(res.body.pricing.auto_discount_satang).toBe(20000);
    expect(res.body.pricing.total_satang).toBe(180000);
  });

  // Scenario 3: Expiration Date Check
  test("3) Expiration Date Check", async () => {
    // Given: Coupon "EXPIRED" (expired yesterday).
    
    const res = await request(app)
      .post("/api/checkout/quote")
      .set("x-auto-discount-percent", "0")
      .send({
        userId: "user1",
        items: [{ productId: "A", qty: 10 }],
        couponCode: "EXPIRED"
      })
      .expect(400);

    // Then:
    // 1) Reject
    expect(res.body.ok).toBe(false);
    // 2) Total unchanged (no coupon discount)
    expect(res.body.pricing.coupon_discount_satang).toBe(0);
    // 3) Message "Coupon expired."
    expect(res.body.errors).toContain("Coupon expired.");
  });

  // Edge Case 1: Coupon Usage Limit
  test("Edge 1) Coupon Usage Limit", async () => {
    // Context: "WELCOME" 1 use/person.
    // Test: Used in Order #1. Try to use in Order #2.
    
    // Order #1: Confirm usage
    await request(app)
      .post("/api/checkout/confirm")
      .set("x-auto-discount-percent", "0")
      .send({
        userId: "user1",
        items: [{ productId: "A", qty: 1 }],
        couponCode: "WELCOME"
      })
      .expect(200);

    // Order #2: Try to use again
    const res = await request(app)
      .post("/api/checkout/quote")
      .set("x-auto-discount-percent", "0")
      .send({
        userId: "user1",
        items: [{ productId: "A", qty: 1 }],
        couponCode: "WELCOME"
      })
      .expect(400);

    // Then:
    // Reject
    expect(res.body.ok).toBe(false);
    expect(res.body.errors).toContain("You already used this.");
  });

  // Edge Case 2: Order of Operations
  test("Edge 2) Order of Operations: 10% then 100 baht", async () => {
    // Context: Item 1000. Discount 10% AND Discount 100 (SAVE100).
    
    const res = await request(app)
      .post("/api/checkout/quote")
      .set("x-auto-discount-percent", "10")
      .send({
        userId: "user1",
        items: [{ productId: "A", qty: 10 }], // 1000
        couponCode: "SAVE100"
      })
      .expect(200);

    // Then:
    // (1000 - 10%) - 100 = 800
    // 1000 - 100 = 900 (after auto)
    // 900 - 100 = 800 (after coupon)
    expect(res.body.pricing.subtotal_satang).toBe(100000);
    expect(res.body.pricing.auto_discount_satang).toBe(10000); // 100 baht
    expect(res.body.pricing.subtotal_after_auto_satang).toBe(90000); // 900 baht
    expect(res.body.pricing.coupon_discount_satang).toBe(10000); // 100 baht
    expect(res.body.pricing.total_satang).toBe(80000); // 800 baht
  });

  // Edge Case 3: Negative Total Protection
  test("Edge 3) Negative Total Protection", async () => {
    // Context: Item 50. Coupon 100.
    
    const res = await request(app)
      .post("/api/checkout/quote")
      .set("x-auto-discount-percent", "0")
      .send({
        userId: "user2",
        items: [{ productId: "C", qty: 1 }], // 50
        couponCode: "WELCOME"
      })
      .expect(200);

    // Then:
    // Total 0. Not -50.
    expect(res.body.pricing.subtotal_satang).toBe(5000); // 50
    expect(res.body.pricing.coupon_discount_satang).toBe(5000); // Capped at subtotal
    expect(res.body.pricing.total_satang).toBe(0);
  });
});
