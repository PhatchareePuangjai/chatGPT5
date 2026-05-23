import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/api/app.js";
import { createTestPool, migrateTestDb, truncateAll } from "../helpers/dbTestHarness.js";
describe("atomicity: audit log failure rolls back stock", () => {
    let pool;
    let app;
    beforeAll(async () => {
        pool = await createTestPool();
        app = createApp(pool);
        await migrateTestDb(pool);
    });
    beforeEach(async () => {
        await truncateAll(pool);
        delete process.env.FORCE_INVENTORY_LOG_FAIL;
    });
    afterAll(async () => {
        delete process.env.FORCE_INVENTORY_LOG_FAIL;
        await pool.end();
    });
    it("does not persist stock deduction when log insert fails", async () => {
        const sku = await pool.query("INSERT INTO skus (code, on_hand_qty, low_stock_threshold) VALUES ($1,$2,$3) RETURNING id", ["SKU-001", 10, 0]);
        const skuId = sku.rows[0].id;
        const order = await pool.query("INSERT INTO orders (status) VALUES ($1) RETURNING id", ["pending"]);
        const orderId = order.rows[0].id;
        await pool.query("INSERT INTO order_lines (order_id, sku_id, qty) VALUES ($1,$2,$3)", [orderId, skuId, 2]);
        process.env.FORCE_INVENTORY_LOG_FAIL = "1";
        const res = await request(app).post(`/api/orders/${orderId}/confirm`).send({});
        expect(res.status).toBe(500);
        const skuAfter = await pool.query("SELECT on_hand_qty FROM skus WHERE id = $1", [skuId]);
        expect(skuAfter.rows[0].on_hand_qty).toBe(10);
        const logs = await pool.query("SELECT 1 FROM inventory_logs WHERE sku_id = $1", [skuId]);
        expect(logs.rowCount).toBe(0);
    });
});
