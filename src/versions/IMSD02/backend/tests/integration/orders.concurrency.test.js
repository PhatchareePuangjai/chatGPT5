import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/api/app.js";
import { createTestPool, migrateTestDb, truncateAll } from "../helpers/dbTestHarness.js";
describe("concurrent confirms do not oversell", () => {
    let pool;
    let app;
    beforeAll(async () => {
        pool = await createTestPool();
        app = createApp(pool);
        await migrateTestDb(pool);
    });
    beforeEach(async () => {
        await truncateAll(pool);
    });
    afterAll(async () => {
        await pool.end();
    });
    it("allows only one confirm when one unit remains", async () => {
        const sku = await pool.query("INSERT INTO skus (code, on_hand_qty, low_stock_threshold) VALUES ($1,$2,$3) RETURNING id", ["SKU-001", 1, 0]);
        const skuId = sku.rows[0].id;
        const orderIds = [];
        for (let i = 0; i < 5; i++) {
            const order = await pool.query("INSERT INTO orders (status) VALUES ($1) RETURNING id", ["pending"]);
            const orderId = order.rows[0].id;
            orderIds.push(orderId);
            await pool.query("INSERT INTO order_lines (order_id, sku_id, qty) VALUES ($1,$2,$3)", [
                orderId,
                skuId,
                1
            ]);
        }
        const results = await Promise.all(orderIds.map((id) => request(app).post(`/api/orders/${id}/confirm`).send({})));
        const successes = results.filter((r) => r.status === 200).length;
        const failures = results.filter((r) => r.status === 409 && r.body?.code === "INSUFFICIENT_STOCK").length;
        expect(successes).toBe(1);
        expect(failures).toBe(4);
        const skuAfter = await pool.query("SELECT on_hand_qty FROM skus WHERE id = $1", [skuId]);
        expect(skuAfter.rows[0].on_hand_qty).toBe(0);
    });
});
