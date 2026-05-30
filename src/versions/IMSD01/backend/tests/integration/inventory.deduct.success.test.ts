import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { makeTestPool } from "../helpers/testDb.js";
import { makeTestApp } from "../helpers/testApp.js";
import { ensureProduct, truncateAll } from "../helpers/seed.js";

describe("inventory deduct (integration)", () => {
  let pool: any;

  beforeAll(async () => {
    pool = await makeTestPool();
  });

  beforeEach(async () => {
    await truncateAll(pool);
    await ensureProduct(pool, { sku: "SKU-001", onHand: 10, threshold: 5 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it("deducts stock and inserts inventory log", async () => {
    const app = makeTestApp(pool);

    const res = await request(app)
      .post("/api/inventory/deduct")
      .send({ orderId: "ORD-123", sku: "SKU-001", quantity: 2 });

    expect(res.status).toBe(200);

    const p = await pool.query("SELECT on_hand FROM products WHERE sku = $1", ["SKU-001"]);
    expect(p.rows[0].on_hand).toBe(8);

    const logs = await pool.query("SELECT type, delta FROM inventory_logs");
    expect(logs.rowCount).toBe(1);
    expect(logs.rows[0]).toMatchObject({ type: "SALE", delta: -2 });
  });
});

