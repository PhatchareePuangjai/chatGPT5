const request = require("supertest");
const app = require("../src/index");
const { pool, query } = require("../src/db");

// Mock UUIDs for testing (valid UUID format required by PG UUID type)
const USER_ID_1 = "00000000-0000-0000-0000-000000000001";
const USER_ID_2 = "00000000-0000-0000-0000-000000000002";

describe("Promotions and Discounts System (v.8) - Scenarios", () => {
  beforeAll(async () => {
    // Ensure DB connection is alive
    const res = await query("SELECT 1");
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // 1. Reset tables
    // Truncate orders, coupons, and history. 
    await query("TRUNCATE user_coupon_history, orders, coupons RESTART IDENTITY CASCADE");

    // 2. Seed Coupons for Scenarios
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Scenarios data
    // SAVE100: Min 500 purchase, 100 discount (fixed)
    // DISCOUNT10: 10% discount (1000 bps)
    // EXPIRED: Expired yesterday
    // WELCOME: 1 time per user, 100 discount (fixed)
    // COMBO: 10% + 100 discount (fixed)
    
    await query(`
      INSERT INTO coupons (code, min_purchase_satang, expires_at, one_time_per_user, percent_bps, fixed_discount_satang, is_active)
      VALUES 
      ('SAVE100',    50000, null,   false, 0,    10000, true),
      ('DISCOUNT10', 0,     null,   false, 1000, 0,     true),
      ('EXPIRED',    0,     $1,     false, 0,    10000, true),
      ('WELCOME',    0,     null,   true,  0,    10000, true),
      ('COMBO',      0,     null,   false, 1000, 10000, true)
    `, [yesterday]);
  });

  // Helper to create an order
  const createOrder = async (userId, originalTotalSatang) => {
    const res = await request(app)
      .post("/api/orders")
      .send({ userId, original_total_satang: originalTotalSatang })
      .expect(201);
    return res.body; 
  };

  // --------------------------------------------------------------------------
  // Scenario 1: Coupon Validation
  // --------------------------------------------------------------------------
  test("1) Coupon Validation: Min purchase 500, Save 100", async () => {
    // Given: Cart total 1000.00 (100000 satang). Coupon "SAVE100".
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "SAVE100" })
      .expect(200);

    // Then: Total reduces 100 (100000 - 10000 = 90000)
    expect(res.body.original_total_satang).toBe(100000);
    expect(res.body.discount_fixed_satang).toBe(10000);
    expect(res.body.grand_total_satang).toBe(90000);
    expect(res.body.applied_coupon.code).toBe("SAVE100");
  });

  // --------------------------------------------------------------------------
  // Scenario 2: Cart Total Discount %
  // --------------------------------------------------------------------------
  test("2) Cart Total Discount %: 10% off", async () => {
    // Given: Cart total 2000.00 (200000 satang). Coupon "DISCOUNT10".
    const order = await createOrder(USER_ID_1, 200000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "DISCOUNT10" })
      .expect(200);

    // Then: 200000 * 10% = 20000. Total 180000.
    expect(res.body.discount_percent_satang).toBe(20000);
    expect(res.body.grand_total_satang).toBe(180000);
  });

  // --------------------------------------------------------------------------
  // Scenario 3: Expiration Date Check
  // --------------------------------------------------------------------------
  test("3) Expiration Date Check", async () => {
    // Given: Coupon "EXPIRED".
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "EXPIRED" })
      .expect(400);

    expect(res.body.error).toBe("COUPON_EXPIRED");
  });

  // --------------------------------------------------------------------------
  // Edge Case 1: Coupon Usage Limit
  // --------------------------------------------------------------------------
  test("Edge 1) Coupon Usage Limit: 1 time per user", async () => {
    const order1 = await createOrder(USER_ID_1, 50000); 
    
    // FIRST USE: Success
    await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order1.id, couponCode: "WELCOME" })
      .expect(200);

    // SECOND USE: Fail
    const order2 = await createOrder(USER_ID_1, 50000);
    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order2.id, couponCode: "WELCOME" })
      .expect(400);

    expect(res.body.error).toBe("COUPON_OVERUSED");
  });

  // --------------------------------------------------------------------------
  // Edge Case 2: Order of Operations
  // --------------------------------------------------------------------------
  test("Edge 2) Order of Operations: 10% then 100 baht", async () => {
    // Context: Item 1000 (100000 satang). Coupon "COMBO" (10% + 100).
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "COMBO" })
      .expect(200);

    // Logic: (1000 - 10%) - 100 = 900 - 100 = 800
    // Satang: (100000 - 10000) - 10000 = 80000
    expect(res.body.discount_percent_satang).toBe(10000);
    expect(res.body.discount_fixed_satang).toBe(10000);
    expect(res.body.grand_total_satang).toBe(80000);
  });

  // --------------------------------------------------------------------------
  // Edge Case 3: Negative Total Protection
  // --------------------------------------------------------------------------
  test("Edge 3) Negative Total Protection", async () => {
    // Context: Item 50 (5000 satang). Coupon "WELCOME" (10000 satang).
    const order = await createOrder(USER_ID_1, 5000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "WELCOME" })
      .expect(200);

    // Then: Total 0. Fixed discount capped at 5000.
    expect(res.body.grand_total_satang).toBe(0);
    expect(res.body.discount_fixed_satang).toBe(5000);
  });
});
