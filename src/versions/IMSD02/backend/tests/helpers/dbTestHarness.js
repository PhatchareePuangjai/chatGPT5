import path from "node:path";
import { createPool } from "../../src/db/pool.js";
import { withTx } from "../../src/db/tx.js";
import { runMigrations } from "../../src/db/migrate.js";
import { getConfig } from "../../src/config/index.js";
export async function createTestPool() {
    const cfg = getConfig();
    return createPool({ database: cfg.POSTGRES_TEST_DB });
}
export async function migrateTestDb(pool) {
    const migrationsDirAbs = path.resolve(process.cwd(), "migrations");
    await withTx(pool, async (client) => {
        await runMigrations(client, migrationsDirAbs);
    });
}
export async function truncateAll(pool) {
    await pool.query("TRUNCATE TABLE low_stock_alerts, inventory_logs, order_lines, orders, skus RESTART IDENTITY");
}
