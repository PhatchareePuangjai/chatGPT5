import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { makeTestPool } from "../helpers/testDb.js";
import { makeTestApp } from "../helpers/testApp.js";
import { ensureProduct, truncateAll } from "../helpers/seed.js";

describe("low stock alert boundary value (integration)", () => {
  let pool: any;

  beforeAll(async () => {
    pool = await makeTestPool();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("does not alert above threshold (7→6), alerts at threshold boundary (6→5)", async () => {
    const app = makeTestApp(pool);

    // Sub-case A: remaining=6, above threshold=5 → no alert
    await truncateAll(pool);
    await ensureProduct(pool, { sku: "SKU-002", onHand: 7, threshold: 5 });
    const resAbove = await request(app)
      .post("/api/inventory/deduct")
      .send({ orderId: "ORD-1", sku: "SKU-002", quantity: 1 });
    expect(resAbove.status).toBe(200);
    expect(resAbove.body.data.lowStockAlertCreated).toBe(false);
    const alertsAbove = await pool.query("SELECT count(*)::int as c FROM stock_alerts");
    expect(alertsAbove.rows[0].c).toBe(0);

    // Sub-case B: remaining=5, exactly at threshold=5 → alert (boundary inclusive <=)
    await truncateAll(pool);
    await ensureProduct(pool, { sku: "SKU-002", onHand: 6, threshold: 5 });
    const resBoundary = await request(app)
      .post("/api/inventory/deduct")
      .send({ orderId: "ORD-2", sku: "SKU-002", quantity: 1 });
    expect(resBoundary.status).toBe(200);
    expect(resBoundary.body.data.onHand).toBe(5);
    expect(resBoundary.body.data.lowStockAlertCreated).toBe(true);
  });
});
