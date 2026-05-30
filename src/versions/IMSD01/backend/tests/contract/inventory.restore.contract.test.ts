import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { makeTestPool } from "../helpers/testDb.js";
import { makeTestApp } from "../helpers/testApp.js";
import { ensureProduct, truncateAll } from "../helpers/seed.js";

describe("POST /api/inventory/restore (contract)", () => {
  let pool: any;

  beforeAll(async () => {
    pool = await makeTestPool();
  });

  beforeEach(async () => {
    await truncateAll(pool);
    await ensureProduct(pool, { sku: "SKU-003", onHand: 5, threshold: 5 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it("returns expected shape on success", async () => {
    const app = makeTestApp(pool);
    const res = await request(app)
      .post("/api/inventory/restore")
      .send({ orderId: "ORD-456", sku: "SKU-003", quantity: 1, reason: "CANCELED" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toMatchObject({
      sku: "SKU-003",
      previousOnHand: 5,
      onHand: 6,
      inventoryLog: { type: "RESTOCK/RETURN", delta: 1 }
    });
  });
});

