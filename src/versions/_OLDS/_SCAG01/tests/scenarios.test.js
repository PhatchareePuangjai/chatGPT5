/**
 * Integration tests for SCAG01 — Shopping Cart System (Node.js + Express + Prisma)
 * Clone/adapted from SCBP01/shopping-cart-app/backend/tests/scenarios.test.js
 *
 * Backend runs at http://localhost:3001 (docker compose up --build from SCAG01/shopping-cart-system/)
 * DB exposed at localhost:5434 (cart_user / cart_password / shopping_cart)
 *
 * API endpoints:
 *   POST /api/seed                     → reset + reseed all products and clear cart
 *   GET  /api/products                 → list products
 *   GET  /api/cart                     → { activeItems, savedItems, grandTotal }
 *   POST /api/cart/add                 → { productId, quantity } — merges if exists
 *   PUT  /api/cart/:id/quantity        → { quantity } — update quantity (0 = remove)
 *   PUT  /api/cart/:id/save            → move item to saved status
 *   DELETE /api/cart/:id/remove        → remove item entirely
 *
 * Seeded products (via /api/seed):
 *   SKU-001: Product A,      10000 cents (100 THB),   stock=10
 *   SKU-002: Product B,       1999 cents (19.99 THB),  stock=10
 *   SKU-003: Product C,       5000 cents,              stock=5  ← limited stock
 *   SKU-004: Product D,      20000 cents,              stock=20
 *   SKU-005: Product E,      35000 cents,              stock=15 ← for save-for-later
 *
 * Amounts are in cents (integer arithmetic — no floating point issues by design).
 * grandTotal and lineTotal are reported in cents.
 */

const axios = require("axios");

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = process.env.API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
  timeout: 10000,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Reset DB and return a sku→productId map for the fresh seed. */
async function resetAndGetProductMap() {
  await api.post("/api/seed");
  const res = await api.get("/api/products");
  const map = {};
  for (const p of res.data) map[p.sku] = p.id;
  return map;
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Shopping Cart Scenarios (SCAG01)", () => {
  let skuMap = {};

  beforeAll(async () => {
    const res = await api.get("/api/products");
    if (res.status !== 200) throw new Error("Backend is not reachable at " + BASE_URL);
  });

  beforeEach(async () => {
    skuMap = await resetAndGetProductMap();
  });

  // ── Acceptance Scenarios ──────────────────────────────────────────────────

  test("Scenario 1: Update Item Quantity", async () => {
    // Given: Cart has Product A (100 THB / 10000 cents) × 1
    const addRes = await api.post("/api/cart/add", {
      productId: skuMap["SKU-001"],
      quantity: 1,
    });
    expect(addRes.status).toBe(200);
    const itemId = addRes.data.id;

    // When: Update quantity to 3
    const updateRes = await api.put(`/api/cart/${itemId}/quantity`, { quantity: 3 });
    expect(updateRes.status).toBe(200);

    // Then:
    const cartRes = await api.get("/api/cart");
    expect(cartRes.status).toBe(200);

    const activeItems = cartRes.data.activeItems;
    const item = activeItems.find((i) => i.productId === skuMap["SKU-001"]);

    // 1) Quantity updated to 3
    expect(item.quantity).toBe(3);
    // 2) Line total = 3 × 10000 = 30000 cents
    expect(item.lineTotal).toBe(30000);
    // 3) Grand total = 30000 cents
    expect(cartRes.data.grandTotal).toBe(30000);
  });

  test("Scenario 2: Merge Items Logic", async () => {
    // Given: Cart has SKU-001 × 1
    await api.post("/api/cart/add", { productId: skuMap["SKU-001"], quantity: 1 });

    // When: Add SKU-001 × 2 again
    const res = await api.post("/api/cart/add", { productId: skuMap["SKU-001"], quantity: 2 });
    expect(res.status).toBe(200);

    // Then:
    const cartRes = await api.get("/api/cart");
    const activeItems = cartRes.data.activeItems;

    // 1) No duplicate rows — only one entry for SKU-001
    const sku001Items = activeItems.filter((i) => i.productId === skuMap["SKU-001"]);
    expect(sku001Items.length).toBe(1);

    // 2) Quantity merged: 1 + 2 = 3
    expect(sku001Items[0].quantity).toBe(3);

    // 3) Total quantity ≤ stock (10) — implicit: merge passed stock check
    expect(sku001Items[0].quantity).toBeLessThanOrEqual(10);
  });

  test("Scenario 3: Save for Later", async () => {
    // Given: SKU-005 in cart (status: active)
    const addRes = await api.post("/api/cart/add", {
      productId: skuMap["SKU-005"],
      quantity: 1,
    });
    expect(addRes.status).toBe(200);
    const itemId = addRes.data.id;

    // When: Save for Later
    const saveRes = await api.put(`/api/cart/${itemId}/save`);
    expect(saveRes.status).toBe(200);

    // Then:
    const cartRes = await api.get("/api/cart");
    const { activeItems, savedItems, grandTotal } = cartRes.data;

    // 1) SKU-005 gone from active cart
    const activeItem = activeItems.find((i) => i.productId === skuMap["SKU-005"]);
    expect(activeItem).toBeUndefined();

    // 2) Grand total reduced (should be 0 — it was the only item)
    expect(grandTotal).toBe(0);

    // 3) Item now in savedItems with status "saved"
    const savedItem = savedItems.find((i) => i.productId === skuMap["SKU-005"]);
    expect(savedItem).toBeDefined();
    expect(savedItem.status).toBe("saved");
    expect(savedItem.quantity).toBe(1);
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────

  test("Edge Case 1: Add More Than Stock", async () => {
    // Context: SKU-003 stock = 5
    // Step 1: Add 3 → OK (3 ≤ 5)
    const first = await api.post("/api/cart/add", {
      productId: skuMap["SKU-003"],
      quantity: 3,
    });
    expect(first.status).toBe(200);

    // Step 2: Add 3 more → 3 + 3 = 6 > 5 → must be rejected
    const second = await api.post("/api/cart/add", {
      productId: skuMap["SKU-003"],
      quantity: 3,
    });
    expect(second.status).toBe(400);
    // Message: "สินค้าไม่เพียงพอ"
    expect(second.data.error).toBe("สินค้าไม่เพียงพอ");

    // Cart quantity must remain at 3 (not 6)
    const cartRes = await api.get("/api/cart");
    const item = cartRes.data.activeItems.find((i) => i.productId === skuMap["SKU-003"]);
    expect(item.quantity).toBe(3);
  });

  test("Edge Case 2: Floating Point Calculation", async () => {
    // Context: SKU-002 = 19.99 THB = 1999 cents
    // Add 3 items: 1999 × 3 = 5997 cents exactly (= 59.97 THB)
    const addRes = await api.post("/api/cart/add", {
      productId: skuMap["SKU-002"],
      quantity: 3,
    });
    expect(addRes.status).toBe(200);

    const cartRes = await api.get("/api/cart");
    const item = cartRes.data.activeItems.find((i) => i.productId === skuMap["SKU-002"]);

    // Line total must be exactly 5997 cents — no floating point drift
    expect(item.lineTotal).toBe(5997);
    // Grand total must match
    expect(cartRes.data.grandTotal).toBe(5997);

    // Confirm 59.97 when converted — no rounding error
    expect(item.lineTotal / 100).toBe(59.97);
  });
});
