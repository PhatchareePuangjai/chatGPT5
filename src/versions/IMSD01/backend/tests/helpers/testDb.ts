import { loadEnv } from "../../src/config/env.js";
import { makePool } from "../../src/db/pool.js";
import { withClient } from "../../src/db/query.js";
import { runMigrations } from "../../src/db/migrate.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export async function makeTestPool() {
  const env = loadEnv();
  const pool = makePool(env);

  // Ensure schema exists for tests.
  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsDir = join(here, "..", "..", "migrations");
  await withClient(pool, async (client) => {
    await runMigrations(client, migrationsDir);
  });

  return pool;
}

