import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { makeTestPool } from "../helpers/testDb.js";
import { makeTestApp } from "../helpers/testApp.js";
import { ensureProduct, truncateAll } from "../helpers/seed.js";

describe("low stock alerts (integration)", () => {
  let pool: any;

  beforeAll(async () => {
    pool = await makeTestPool();
  });

  beforeEach(async () => {
    await truncateAll(pool);
    await ensureProduct(pool, { sku: "SKU-002", onHand: 6, threshold: 5 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it("creates an alert when quantity becomes <= threshold", async () => {
    const app = makeTestApp(pool);
    const res = await request(app)
      .post("/api/inventory/deduct")
      .send({ orderId: "ORD-1", sku: "SKU-002", quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.lowStockAlertCreated).toBe(true);

    const alerts = await pool.query("SELECT threshold, observed_on_hand FROM stock_alerts");
    expect(alerts.rowCount).toBe(1);
    expect(alerts.rows[0]).toMatchObject({ threshold: 5, observed_on_hand: 4 });
  });
});

