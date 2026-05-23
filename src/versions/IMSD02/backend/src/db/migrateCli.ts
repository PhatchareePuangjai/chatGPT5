import path from "node:path";
import { createPool } from "./pool.js";
import { withTx } from "./tx.js";
import { runMigrations } from "./migrate.js";

const pool = createPool();

async function main() {
  const migrationsDirAbs = path.resolve(process.cwd(), "migrations");
  await withTx(pool, async (client) => {
    await runMigrations(client, migrationsDirAbs);
  });
  await pool.end();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  try {
    await pool.end();
  } catch {
    // ignore
  }
  process.exitCode = 1;
});
