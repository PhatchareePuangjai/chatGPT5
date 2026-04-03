/**
 * Integration tests for SCCS01 — Shopping Cart (FastAPI backend)
 * Clone/adapted from SCCE01/shopping-cart/backend/tests/scenarios.test.js
 *
 * Backend runs at http://localhost:8000 (docker compose up --build from SCCS01/)
 * DB exposed at   127.0.0.1:5432  user/pass/db = postgres/postgres/cartdb
 *
 * Seeded products (from backend/app/seed.py):
 *   SKU-001   → Product A,    price_cents: 10000, stock_qty: 10
 *   SKU-005   → Product E,    price_cents: 25000, stock_qty: 5
 *   SKU-01999 → Product 19.99, price_cents: 1999,  stock_qty: 20
 */

const axios = require("axios");
const { Pool } = require("pg");

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = process.env.API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
  timeout: 10000,
});

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "cartdb",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function resetDB() {
  // Remove cart-related data; products remain (seeded once at startup)
  await pool.query("DELETE FROM cart_items");
  await pool.query("DELETE FROM carts");
}

async function createCart() {
  const res = await api.post("/api/carts");
  expect(res.status).toBe(200);
  return res.data; // CartOut { id, active_items, saved_items, grand_total_cents }
}

async function addItem(cartId, sku, quantity) {
  return api.post(`/api/carts/${cartId}/items`, { sku, quantity });
}

async function updateItem(cartId, itemId, quantity) {
  return api.patch(`/api/carts/${cartId}/items/${itemId}`, { quantity });
}

async function saveForLater(cartId, itemId) {
  return api.post(`/api/carts/${cartId}/items/${itemId}/save`);
}

async function getCart(cartId) {
  return api.get(`/api/carts/${cartId}`);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Shopping Cart Scenarios (SCCS01)", () => {
  beforeAll(async () => {
    const res = await api.get("/api/health");
    if (res.status !== 200) throw new Error("Backend is not reachable at " + BASE_URL);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await resetDB();
  });

  // ── Acceptance Scenarios ──────────────────────────────────────────────────

  test("Scenario 1: Update Item Quantity — เพิ่มจำนวนสินค้าในตะกร้า", async () => {
    // Given: Cart has Product A (SKU-001, 100 บาท) x 1
    const cart = await createCart();
    const addRes = await addItem(cart.id, "SKU-001", 1);
    expect(addRes.status).toBe(200);
    const itemId = addRes.data.active_items[0].id;

    // When: Update quantity to 3
    const res = await updateItem(cart.id, itemId, 3);

    // Then:
    // 1) Quantity is 3
    expect(res.status).toBe(200);
    const item = res.data.active_items.find((i) => i.sku === "SKU-001");
    expect(item.quantity).toBe(3);

    // 2) Line total = 3 × 10,000 = 30,000 cents
    expect(item.line_total_cents).toBe(30000);

    // 3) Grand total updated correctly
    expect(res.data.grand_total_cents).toBe(30000);
  });

  test("Scenario 2: Merge Items Logic — รวมรายการสินค้าซ้ำ", async () => {
    // Given: Cart has SKU-001 x 1
    const cart = await createCart();
    await addItem(cart.id, "SKU-001", 1);

    // When: Add SKU-001 x 2 again
    const res = await addItem(cart.id, "SKU-001", 2);

    // Then:
    // 1) No duplicate rows — only one entry for SKU-001
    expect(res.status).toBe(200);
    const sku001Items = res.data.active_items.filter((i) => i.sku === "SKU-001");
    expect(sku001Items).toHaveLength(1);

    // 2) Quantity merged: 1 + 2 = 3
    expect(sku001Items[0].quantity).toBe(3);

    // 3) Verify via DB — single row in cart_items for this product
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE p.sku = $1`,
      ["SKU-001"]
    );
    expect(parseInt(rows[0].cnt)).toBe(1);
  });

  test("Scenario 3: Save for Later — ย้ายสินค้าไปรายการ Saved", async () => {
    // Given: SKU-005 in active cart
    const cart = await createCart();
    const addRes = await addItem(cart.id, "SKU-005", 1);
    expect(addRes.status).toBe(200);
    const itemId = addRes.data.active_items[0].id;
    const activeTotalBefore = addRes.data.grand_total_cents; // 25,000 cents

    // When: Save for Later
    const res = await saveForLater(cart.id, itemId);

    // Then:
    expect(res.status).toBe(200);

    // 1) SKU-005 disappears from active items
    const stillActive = res.data.active_items.find((i) => i.sku === "SKU-005");
    expect(stillActive).toBeUndefined();

    // 2) Grand total drops to 0 (it was the only active item)
    expect(res.data.grand_total_cents).toBe(0);
    expect(res.data.grand_total_cents).toBeLessThan(activeTotalBefore);

    // 3) SKU-005 appears in saved_items with status SAVED
    const savedItem = res.data.saved_items.find((i) => i.sku === "SKU-005");
    expect(savedItem).toBeDefined();
    expect(savedItem.status).toBe("SAVED");
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────

  test("Edge Case 1: Add More Than Stock — สินค้าไม่เพียงพอ", async () => {
    // Context: SKU-005 stock = 5. Cart has 3 already.
    const cart = await createCart();
    const firstAdd = await addItem(cart.id, "SKU-005", 3);
    expect(firstAdd.status).toBe(200);

    // Test: Try to add 3 more (3 + 3 = 6 > 5)
    const res = await addItem(cart.id, "SKU-005", 3);

    // Expect: Rejected with 409
    expect(res.status).toBe(409);

    // Cart quantity must remain at 3 — not updated to 6
    const cartRes = await getCart(cart.id);
    expect(cartRes.status).toBe(200);
    const item = cartRes.data.active_items.find((i) => i.sku === "SKU-005");
    expect(item.quantity).toBe(3);
  });

  test("Edge Case 2: Floating Point Calculation — 19.99 × 3 = 59.97 เป๋ะ", async () => {
    // Context: SKU-01999 = 19.99 บาท (1999 cents). Add 3 items.
    // Expected: 1999 × 3 = 5997 cents (59.97 บาท exactly — no floating point drift)
    const cart = await createCart();

    const res = await addItem(cart.id, "SKU-01999", 3);

    expect(res.status).toBe(200);

    const item = res.data.active_items.find((i) => i.sku === "SKU-01999");
    expect(item.quantity).toBe(3);
    expect(item.price_cents).toBe(1999);

    // line_total_cents must be exactly 5997 (no floating-point rounding error)
    expect(item.line_total_cents).toBe(5997);
    expect(res.data.grand_total_cents).toBe(5997);
  });
});
