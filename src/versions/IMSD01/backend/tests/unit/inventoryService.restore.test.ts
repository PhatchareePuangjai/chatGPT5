import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import { makeTestPool } from "../helpers/testDb.js";
import { ensureProduct, truncateAll } from "../helpers/seed.js";
import { inventoryService } from "../../src/services/inventoryService.js";

describe("inventoryService.restore (unit-ish)", () => {
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

  it("restore returns expected values", async () => {
    const out = await inventoryService(pool).restore({
      orderId: "ORD-1",
      sku: "SKU-003",
      quantity: 1,
      reason: "CANCELED"
    });
    expect(out).toMatchObject({
      sku: "SKU-003",
      previousOnHand: 5,
      onHand: 6,
      inventoryLog: { type: "RESTOCK/RETURN", delta: 1 }
    });
  });
});

