// Runs against a real PostgreSQL instance, matching every other version.
// (Previously this suite jest.mock()ed the db layer and asserted against a
// hand-written in-memory fake, so no SQL was ever executed.)
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgres://app:app@localhost:5432/promo";

const request = require("supertest");
const app = require("../src/index");
const db = require("../src/db");

const USER_ID_1 = "00000000-0000-0000-0000-000000000001";
const USER_ID_2 = "00000000-0000-0000-0000-000000000002";

// Coupon fixtures required by scenarios_promotions.md.
const COUPONS = [
  // Scenario 1: min purchase 500 THB, 100 THB off
  ["SAVE100", 50000, "NOW() + INTERVAL '365 days'", false, 0, 10000],
  // Scenario 2: 10% off
  ["DISCOUNT10", 0, "NOW() + INTERVAL '365 days'", false, 1000, 0],
  // Scenario 3: expired yesterday
  ["EXPIRED", 0, "NOW() - INTERVAL '1 day'", false, 0, 10000],
  // Edge 1: one use per user
  ["WELCOME", 0, "NOW() + INTERVAL '365 days'", true, 0, 10000],
  // Edge 2: 10% and 100 THB on the same coupon
  ["COMBO", 0, "NOW() + INTERVAL '365 days'", false, 1000, 10000],
];

async function seedCoupons() {
  for (const [code, min, expires, oneTime, bps, fixed] of COUPONS) {
    await db.query(
      `INSERT INTO coupons (code, min_purchase_satang, expires_at, one_time_per_user, percent_bps, fixed_discount_satang, is_active)
       VALUES ($1, $2, ${expires}, $3, $4, $5, TRUE)
       ON CONFLICT (code) DO UPDATE SET
         min_purchase_satang = EXCLUDED.min_purchase_satang,
         expires_at = EXCLUDED.expires_at,
         one_time_per_user = EXCLUDED.one_time_per_user,
         percent_bps = EXCLUDED.percent_bps,
         fixed_discount_satang = EXCLUDED.fixed_discount_satang,
         is_active = TRUE`,
      [code, min, oneTime, bps, fixed]
    );
  }
}

const createOrder = async (userId, originalTotalSatang) => {
  const res = await request(app)
    .post("/api/orders")
    .send({ userId, original_total_satang: originalTotalSatang })
    .expect(201);
  return res.body;
};

describe("Promotions and Discounts System (PDCE01) - Scenarios", () => {
  beforeAll(async () => {
    await db.query("SELECT 1");
  });

  afterAll(async () => {
    await db.pool.end();
  });

  beforeEach(async () => {
    await db.query("TRUNCATE user_coupon_history CASCADE");
    await db.query("DELETE FROM orders");
    await seedCoupons();
  });

  // Scenario 1: Coupon Validation ------------------------------------------
  test("1) Coupon Validation: Min purchase 500, Save 100", async () => {
    // Given: cart total 1,000 THB (100000 satang), coupon SAVE100 (min 500 THB)
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "SAVE100" })
      .expect(200);

    // 1) minimum purchase satisfied, 2) total drops by 100 THB
    expect(res.body.original_total_satang).toBe(100000);
    expect(res.body.discount_fixed_satang).toBe(10000);
    expect(res.body.grand_total_satang).toBe(90000);
    expect(res.body.applied_coupon.code).toBe("SAVE100");

    // The discount must actually be persisted, not just echoed back.
    const persisted = await request(app).get(`/api/orders/${order.id}`).expect(200);
    expect(persisted.body.grand_total_satang).toBe(90000);

    // Below the minimum the same coupon must be rejected.
    const smallOrder = await createOrder(USER_ID_2, 40000);
    const rejected = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_2, orderId: smallOrder.id, couponCode: "SAVE100" })
      .expect(400);
    expect(rejected.body.error).toBe("MIN_PURCHASE_NOT_MET");
  });

  // Scenario 2: Cart Total Discount % ---------------------------------------
  test("2) Cart Total Discount %: 10% off", async () => {
    // Given: cart total 2,000 THB, promotion 10%
    const order = await createOrder(USER_ID_1, 200000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "DISCOUNT10" })
      .expect(200);

    // 200000 * 10% = 20000; grand total 180000
    expect(res.body.discount_percent_satang).toBe(20000);
    expect(res.body.grand_total_satang).toBe(180000);

    const persisted = await request(app).get(`/api/orders/${order.id}`).expect(200);
    expect(persisted.body.discount_percent_satang).toBe(20000);
    expect(persisted.body.grand_total_satang).toBe(180000);
  });

  // Scenario 3: Expiration Date Check ---------------------------------------
  test("3) Expiration Date Check", async () => {
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "EXPIRED" })
      .expect(400);

    expect(res.body.error).toBe("COUPON_EXPIRED");

    // Total must be unchanged.
    const persisted = await request(app).get(`/api/orders/${order.id}`).expect(200);
    expect(persisted.body.grand_total_satang).toBe(100000);
    expect(persisted.body.applied_coupon_id).toBeNull();
  });

  // Edge Case 1: Coupon Usage Limit -----------------------------------------
  test("Edge 1) Coupon Usage Limit: 1 time per user", async () => {
    const order1 = await createOrder(USER_ID_1, 50000);
    await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order1.id, couponCode: "WELCOME" })
      .expect(200);

    const order2 = await createOrder(USER_ID_1, 50000);
    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order2.id, couponCode: "WELCOME" })
      .expect(400);

    expect(res.body.error).toBe("COUPON_OVERUSED");

    // No discount may be applied on the second order.
    const persisted = await request(app).get(`/api/orders/${order2.id}`).expect(200);
    expect(persisted.body.grand_total_satang).toBe(50000);
  });

  // Edge Case 2: Order of Operations ----------------------------------------
  test("Edge 2) Order of Operations: 10% then 100 baht", async () => {
    // (1000 - 10%) - 100 = 800, never (1000 - 100) - 10% = 810
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "COMBO" })
      .expect(200);

    expect(res.body.discount_percent_satang).toBe(10000);
    expect(res.body.discount_fixed_satang).toBe(10000);
    expect(res.body.grand_total_satang).toBe(80000);
  });

  // Edge Case 3: Negative Total Protection ----------------------------------
  test("Edge 3) Negative Total Protection", async () => {
    // 50 THB order, 100 THB coupon -> 0, never negative
    const order = await createOrder(USER_ID_1, 5000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "WELCOME" })
      .expect(200);

    expect(res.body.grand_total_satang).toBe(0);
    expect(res.body.discount_fixed_satang).toBe(5000);

    const persisted = await request(app).get(`/api/orders/${order.id}`).expect(200);
    expect(persisted.body.grand_total_satang).toBe(0);
  });
});
