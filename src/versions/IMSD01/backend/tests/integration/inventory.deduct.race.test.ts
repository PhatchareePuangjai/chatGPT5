import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { makeTestPool } from "../helpers/testDb.js";
import { makeTestApp } from "../helpers/testApp.js";
import { ensureProduct, truncateAll } from "../helpers/seed.js";

describe("inventory deduct race condition (integration)", () => {
  let pool: any;

  beforeAll(async () => {
    pool = await makeTestPool();
  });

  beforeEach(async () => {
    await truncateAll(pool);
    await ensureProduct(pool, { sku: "SKU-001", onHand: 1, threshold: 5 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it("only allows one successful purchase for last unit", async () => {
    const app = makeTestApp(pool);

    const reqs = Array.from({ length: 5 }).map((_, i) =>
      request(app)
        .post("/api/inventory/deduct")
        .send({ orderId: `ORD-${i}`, sku: "SKU-001", quantity: 1 })
    );

    const results = await Promise.all(reqs);
    const ok = results.filter((r: any) => r.status === 200);
    const conflict = results.filter((r: any) => r.status === 409);

    expect(ok.length).toBe(1);
    expect(conflict.length).toBe(4);

    const p = await pool.query("SELECT on_hand FROM products WHERE sku = $1", ["SKU-001"]);
    expect(p.rows[0].on_hand).toBe(0);
  });
});
