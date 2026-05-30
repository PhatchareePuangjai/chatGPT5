import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type pg from "pg";

export async function runMigrations(client: pg.PoolClient, migrationsDir: string) {
  await client.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )`
  );

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const f of files) {
    const already = await client.query("SELECT 1 FROM schema_migrations WHERE filename = $1", [f]);
    if (already.rowCount) continue;

    const sql = readFileSync(join(migrationsDir, f), "utf-8");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations(filename) VALUES ($1)", [f]);
  }
}

