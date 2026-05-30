import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import { makeTestPool } from "../helpers/testDb.js";
import { ensureProduct, truncateAll } from "../helpers/seed.js";
import { inventoryService } from "../../src/services/inventoryService.js";

describe("inventoryService.deduct (unit-ish)", () => {
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

  it("deduct returns expected values", async () => {
    const out = await inventoryService(pool).deduct({ orderId: "ORD-1", sku: "SKU-001", quantity: 2 });
    expect(out).toMatchObject({
      sku: "SKU-001",
      previousOnHand: 10,
      onHand: 8,
      inventoryLog: { type: "SALE", delta: -2 }
    });
  });
});

