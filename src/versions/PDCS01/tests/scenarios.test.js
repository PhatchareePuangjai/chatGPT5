/**
 * Integration tests for PDCS01 — Promotions & Discounts App (Node.js/Express backend)
 * Clone/adapted from PDCE01/promotions-discounts-system/backend/tests/scenarios.test.js
 *
 * Backend runs at  http://localhost:4000  (docker compose up --build from PDCS01/promotions-app/)
 * DB exposed at    127.0.0.1:5434         user/pass/db = promo/promo/promotions
 */

const axios = require("axios");
const { Pool } = require("pg");

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = process.env.API_URL || "http://localhost:4000";

// axios instance — never throws on HTTP error status
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
  timeout: 10000,
});

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "5434"),
  user: process.env.DB_USER || "promo",
  password: process.env.DB_PASSWORD || "promo",
  database: process.env.DB_NAME || "promotions",
});

// ─── DB Helpers ───────────────────────────────────────────────────────────────
async function resetDB() {
  const now = new Date();
  const yesterday  = new Date(now); yesterday.setDate(now.getDate() - 1);
  const twoDaysAgo = new Date(now); twoDaysAgo.setDate(now.getDate() - 2);
  const tomorrow   = new Date(now); tomorrow.setDate(now.getDate() + 1);

  // Wipe everything (CASCADE handles FK order)
  await pool.query(
    "TRUNCATE carts, coupons, cart_discounts, coupon_usages, promotion_events RESTART IDENTITY CASCADE"
  );

  // Seed coupons matching scenarios_promotions.md
  await pool.query(
    `INSERT INTO coupons
       (code, type, value_cents, value_percent, min_subtotal_cents, start_at, end_at, usage_limit_per_user)
     VALUES
       ('SAVE100', 'fixed',   10000, 0,  50000, $1, $2, 100),
       ('CART10',  'percent', 0,     10, 0,     $1, $2, 100),
       ('EXPIRED', 'fixed',   10000, 0,  0,     $3, $4, 100),
       ('WELCOME', 'fixed',   10000, 0,  0,     $1, $2, 1)`,
    [
      yesterday.toISOString(),
      tomorrow.toISOString(),
      twoDaysAgo.toISOString(),
      yesterday.toISOString(),
    ]
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Promotions and Discounts Scenarios (PDCS01)", () => {
  beforeAll(async () => {
    const res = await api.get("/health");
    if (res.status !== 200) throw new Error("Backend is not reachable at " + BASE_URL);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await resetDB();
  });

  // ── Acceptance Scenarios ──────────────────────────────────────────────────

  test("Scenario 1: Coupon Validation — Min purchase 500 บาท, Save 100 บาท", async () => {
    // Given: Cart total 1,000 บาท (100,000 cents). Coupon "SAVE100" (min 500 บาท = 50,000 cents).
    const userId = "user-scenario-1";
    await pool.query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 100000]);

    const res = await api.post("/api/promotions/apply", { userId, couponCode: "SAVE100" });

    // Then: discount 100 บาท, grand total 900 บาท
    expect(res.status).toBe(200);
    expect(res.data.message).toMatch(/สำเร็จ|success/i);
    expect(res.data.applied_discount_cents).toBe(10000);
    expect(res.data.cart.subtotal_cents).toBe(100000);
    expect(res.data.cart.discount_total_cents).toBe(10000);
    expect(res.data.cart.grand_total_cents).toBe(90000);
  });

  test("Scenario 2: Cart Total Discount % — ลด 10% ท้ายบิล", async () => {
    // Given: Cart total 2,000 บาท (200,000 cents). Promotion 10%.
    const userId = "user-scenario-2";
    await pool.query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 200000]);

    const res = await api.post("/api/promotions/apply", { userId, couponCode: "CART10" });

    // Then: 200,000 * 10% = 20,000 cents. Grand total 180,000 cents.
    expect(res.status).toBe(200);
    expect(res.data.applied_discount_cents).toBe(20000);
    expect(res.data.cart.discount_total_cents).toBe(20000);
    expect(res.data.cart.grand_total_cents).toBe(180000);
  });

  test("Scenario 3: Expiration Date Check — คูปองหมดอายุ", async () => {
    // Given: Coupon "EXPIRED" expired yesterday. Cart 1,000 บาท.
    const userId = "user-scenario-3";
    await pool.query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 100000]);

    const res = await api.post("/api/promotions/apply", { userId, couponCode: "EXPIRED" });

    // Then: Request rejected, total unchanged
    expect(res.status).not.toBe(200);
    expect(res.data.error).toMatch(/expired|หมดอายุ/i);

    const cartRes = await api.get(`/api/cart?userId=${userId}`);
    expect(cartRes.status).toBe(200);
    expect(cartRes.data.discount_total_cents).toBe(0);
    expect(cartRes.data.grand_total_cents).toBe(100000);
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────

  test("Edge Case 1: Coupon Usage Limit — WELCOME ใช้ได้ 1 ครั้ง/คน", async () => {
    // Context: "WELCOME" usage_limit_per_user = 1
    const userId = "user-edge-1";
    await pool.query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 50000]);

    // First use: should succeed
    const res1 = await api.post("/api/promotions/apply", { userId, couponCode: "WELCOME" });
    expect(res1.status).toBe(200);

    // Remove the discount line so the coupon can be re-attempted in the same cart
    await pool.query("DELETE FROM cart_discounts WHERE coupon_code = $1", ["WELCOME"]);

    // Second use (same user): must be rejected
    const res2 = await api.post("/api/promotions/apply", { userId, couponCode: "WELCOME" });
    expect(res2.status).toBe(400);
    expect(JSON.stringify(res2.data)).toMatch(/limit|ครบ|usage/i);
  });

  test("Edge Case 2: Order of Operations — (1,000 - 10%) - 100 = 800 บาท", async () => {
    // Context: Cart 1,000 บาท (100,000 cents). Apply percent first, then fixed.
    // CART10 = 10% = 10,000 cents. SAVE100 = fixed 10,000 cents.
    // Expected: total discount = 20,000 cents. Grand total = 80,000 cents.
    const userId = "user-edge-2";
    await pool.query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 100000]);

    // Step 1: Apply percent discount (priority 1 — applied first)
    const res1 = await api.post("/api/promotions/apply", { userId, couponCode: "CART10" });
    expect(res1.status).toBe(200);

    // Step 2: Apply fixed discount (priority 2 — applied second)
    const res2 = await api.post("/api/promotions/apply", { userId, couponCode: "SAVE100" });
    expect(res2.status).toBe(200);

    // Final: (100,000 - 10%) - 10,000 = 90,000 - 10,000 = 80,000 cents
    expect(res2.data.cart.discount_total_cents).toBe(20000);
    expect(res2.data.cart.grand_total_cents).toBe(80000);
  });

  test("Edge Case 3: Negative Total Protection — ยอดสุทธิต้องไม่ติดลบ", async () => {
    // Context: Cart 50 บาท (5,000 cents). Coupon "WELCOME" = fixed 100 บาท (10,000 cents).
    // Expected: Grand total clamped to 0 (not -50 บาท)
    const userId = "user-edge-3";
    await pool.query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 5000]);

    const res = await api.post("/api/promotions/apply", { userId, couponCode: "WELCOME" });

    expect(res.status).toBe(200);
    expect(res.data.cart.grand_total_cents).toBe(0);
    // Subtotal still 5,000; discount applied but clamped only at grand total
    expect(res.data.cart.subtotal_cents).toBe(5000);
  });
});
