import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/api/app.js";
import { createTestPool, migrateTestDb, truncateAll } from "../helpers/dbTestHarness.js";
describe("low stock threshold boundary", () => {
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
    it("does not alert at 6, alerts at 5 and 4 when threshold is 5", async () => {
        // 7 -> 6: no alert
        const sku = await pool.query("INSERT INTO skus (code, on_hand_qty, low_stock_threshold) VALUES ($1,$2,$3) RETURNING id", ["SKU-002", 7, 5]);
        const skuId = sku.rows[0].id;
        const orderA = await pool.query("INSERT INTO orders (status) VALUES ($1) RETURNING id", ["pending"]);
        const orderAId = orderA.rows[0].id;
        await pool.query("INSERT INTO order_lines (order_id, sku_id, qty) VALUES ($1,$2,$3)", [
            orderAId,
            skuId,
            1
        ]);
        const resA = await request(app).post(`/api/orders/${orderAId}/confirm`).send({});
        expect(resA.status).toBe(200);
        const alertsAfterA = await pool.query("SELECT 1 FROM low_stock_alerts WHERE sku_id = $1", [skuId]);
        expect(alertsAfterA.rowCount).toBe(0);
        // reset SKU to 6 -> 5: alert
        await pool.query("UPDATE skus SET on_hand_qty = 6 WHERE id = $1", [skuId]);
        const orderB = await pool.query("INSERT INTO orders (status) VALUES ($1) RETURNING id", ["pending"]);
        const orderBId = orderB.rows[0].id;
        await pool.query("INSERT INTO order_lines (order_id, sku_id, qty) VALUES ($1,$2,$3)", [
            orderBId,
            skuId,
            1
        ]);
        const resB = await request(app).post(`/api/orders/${orderBId}/confirm`).send({});
        expect(resB.status).toBe(200);
        const alertsAfterB = await pool.query("SELECT 1 FROM low_stock_alerts WHERE sku_id = $1", [skuId]);
        expect(alertsAfterB.rowCount).toBe(1);
    });
});
