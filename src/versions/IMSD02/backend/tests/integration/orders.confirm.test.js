import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/api/app.js";
import { createTestPool, migrateTestDb, truncateAll } from "../helpers/dbTestHarness.js";
describe("POST /api/orders/:orderId/confirm", () => {
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
    it("deducts stock and writes audit log", async () => {
        const sku = await pool.query("INSERT INTO skus (code, on_hand_qty, low_stock_threshold) VALUES ($1,$2,$3) RETURNING id", ["SKU-001", 10, 5]);
        const skuId = sku.rows[0].id;
        const order = await pool.query("INSERT INTO orders (status) VALUES ($1) RETURNING id", ["pending"]);
        const orderId = order.rows[0].id;
        await pool.query("INSERT INTO order_lines (order_id, sku_id, qty) VALUES ($1,$2,$3)", [
            orderId,
            skuId,
            2
        ]);
        const res = await request(app).post(`/api/orders/${orderId}/confirm`).send({
            confirmedAt: "2026-05-23T00:00:00Z"
        });
        expect(res.status).toBe(200);
        const skuAfter = await pool.query("SELECT on_hand_qty FROM skus WHERE id = $1", [skuId]);
        expect(skuAfter.rows[0].on_hand_qty).toBe(8);
        const logs = await pool.query("SELECT delta_qty, reason FROM inventory_logs WHERE sku_id = $1 ORDER BY id ASC", [skuId]);
        expect(logs.rowCount).toBe(1);
        expect(logs.rows[0].delta_qty).toBe(-2);
        expect(logs.rows[0].reason).toBe("sale");
    });
});
