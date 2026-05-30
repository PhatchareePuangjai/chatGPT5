import "dotenv/config";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadEnv } from "../config/env.js";
import { makePool } from "../db/pool.js";
import { withClient } from "../db/query.js";
import { runMigrations } from "../db/migrate.js";

const env = loadEnv();
const pool = makePool(env);

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "..", "migrations");

await withClient(pool, async (client) => {
  await runMigrations(client, migrationsDir);
});

await pool.end();

// eslint-disable-next-line no-console
console.log(JSON.stringify({ level: "info", msg: "migrations_applied" }));

