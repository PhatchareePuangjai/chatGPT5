import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { makeTestPool } from "../helpers/testDb.js";
import { makeTestApp } from "../helpers/testApp.js";
import { ensureProduct, truncateAll } from "../helpers/seed.js";

describe("POST /api/inventory/deduct (contract)", () => {
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

  it("returns expected shape on success", async () => {
    const app = makeTestApp(pool);
    const res = await request(app)
      .post("/api/inventory/deduct")
      .set("X-Request-Id", "test-req-1")
      .send({ orderId: "ORD-123", sku: "SKU-001", quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toMatchObject({
      sku: "SKU-001",
      previousOnHand: 10,
      onHand: 8,
      inventoryLog: { type: "SALE", delta: -2 }
    });
    expect(typeof res.body.data.lowStockAlertCreated).toBe("boolean");
  });
});

