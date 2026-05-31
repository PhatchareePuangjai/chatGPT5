import { beforeAll, afterAll } from 'vitest';
import { pool } from '../src/db/index.js';
import { applyMigrations } from '../src/db/migrate.js';
beforeAll(async () => {
    await applyMigrations();
});
afterAll(async () => {
    await pool.end();
});
