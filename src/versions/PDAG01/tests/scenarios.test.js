/**
 * Integration tests for PDAG01 — Promotions and Discounts (FastAPI backend)
 * Clone/adapted from PDBP01/promo-shop-plug-and-play/backend/tests/scenarios.test.js
 *
 * Backend runs at http://localhost:8000 (docker compose up --build from PDAG01/)
 * No PostgreSQL — backend uses in-memory mock data (no pg pool needed)
 *
 * API endpoint:
 *   POST /api/calculate_discount
 *     Body:    { cart_total: number, coupons: string[], user_id?: string }
 *     Success: { original_total, discount_amount, final_total, message }
 *     Error:   HTTP 400  { detail: "..." }
 *
 * Pre-seeded coupons (in-memory):
 *   SAVE100    — fixed -100, min_purchase 500, no usage limit
 *   10PERCENT  — 10% off, no min, no usage limit
 *   EXPIRED    — fixed -50, expired yesterday
 *   WELCOME    — fixed -50, usage limit 1/user
 *
 * Pre-seeded usage:
 *   user123 → WELCOME: 1  (already exhausted the limit)
 */

const axios = require("axios");

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = process.env.API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
  timeout: 10000,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function calcDiscount(cartTotal, coupons, userId = null) {
  const body = { cart_total: cartTotal, coupons };
  if (userId) body.user_id = userId;
  return api.post("/api/calculate_discount", body);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Promotions and Discounts Scenarios (PDAG01)", () => {
  beforeAll(async () => {
    const res = await api.get("/");
    if (res.status !== 200) throw new Error("Backend is not reachable at " + BASE_URL);
  });

  // ── Acceptance Scenarios ──────────────────────────────────────────────────

  test("Scenario 1: Coupon Validation — Min purchase 500 บาท, Save 100 บาท", async () => {
    // Given: cart_total = 1,000. Coupon "SAVE100" (min purchase 500, save 100).
    const res = await calcDiscount(1000, ["SAVE100"]);

    // Then:
    // 1) Min condition met (1,000 >= 500) → accepted
    expect(res.status).toBe(200);
    // 2) Discount: 100 บาท → final total: 900 บาท
    expect(res.data.original_total).toBe(1000);
    expect(res.data.discount_amount).toBe(100);
    expect(res.data.final_total).toBe(900);
    // 3) Message "ใช้คูปองสำเร็จ"
    expect(res.data.message).toBe("ใช้คูปองสำเร็จ");
  });

  test("Scenario 2: Cart Total Discount % — ลด 10% ท้ายบิล", async () => {
    // Given: cart_total = 2,000. Promotion 10% off.
    const res = await calcDiscount(2000, ["10PERCENT"]);

    expect(res.status).toBe(200);
    // Discount: 2,000 × 10% = 200 บาท → Grand Total = 1,800 บาท
    expect(res.data.original_total).toBe(2000);
    expect(res.data.discount_amount).toBe(200);
    expect(res.data.final_total).toBe(1800);
  });

  test("Scenario 3: Expiration Date Check — คูปองหมดอายุ", async () => {
    // Given: Coupon "EXPIRED" expired yesterday.
    const res = await calcDiscount(1000, ["EXPIRED"]);

    // Then:
    // 1) Reject (HTTP 400)
    expect(res.status).toBe(400);
    // 2) Total unchanged — no discount applied
    // 3) Message "คูปองหมดอายุ"
    expect(res.data.detail).toBe("คูปองหมดอายุ");
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────

  test("Edge Case 1: Coupon Usage Limit — WELCOME ใช้ได้ 1 ครั้ง/คน", async () => {
    // Context: "WELCOME" limit is 1 use per user.
    // The in-memory mock pre-seeds user123 with WELCOME usage = 1 (already exhausted).

    // Order #1: Fresh user ("user_new") — first use → must succeed
    const order1 = await calcDiscount(500, ["WELCOME"], "user_new");
    expect(order1.status).toBe(200);
    expect(order1.data.discount_amount).toBe(50);

    // Order #2: user123 has already used WELCOME → must be rejected
    const order2 = await calcDiscount(500, ["WELCOME"], "user123");
    expect(order2.status).toBe(400);
    // Message: "คุณใช้สิทธิ์ครบแล้ว"
    expect(order2.data.detail).toBe("คุณใช้สิทธิ์ครบแล้ว");
  });

  test("Edge Case 2: Order of Operations — (1,000 - 10%) - 100 = 800 บาท", async () => {
    // Context: cart_total = 1,000. Apply 10% discount then fixed -100 (SAVE100).
    // Correct order: percentage first, then fixed.
    // 1,000 × 10% = 100 off → 900; then -100 → 800
    const res = await calcDiscount(1000, ["10PERCENT", "SAVE100"]);

    expect(res.status).toBe(200);
    // Total discount = 100 (10%) + 100 (fixed) = 200
    expect(res.data.original_total).toBe(1000);
    expect(res.data.discount_amount).toBe(200);
    expect(res.data.final_total).toBe(800);
  });

  test("Edge Case 3: Negative Total Protection — ยอดสุทธิต้องไม่ติดลบ", async () => {
    // Context: cart_total = 50 บาท. WELCOME coupon gives 50 บาท off.
    // Final total must be 0, NOT -50.
    const res = await calcDiscount(50, ["WELCOME"], "user_brand_new");

    expect(res.status).toBe(200);
    expect(res.data.original_total).toBe(50);
    // Discount capped so total doesn't go negative
    expect(res.data.final_total).toBe(0);
    expect(res.data.final_total).toBeGreaterThanOrEqual(0);
  });
});
