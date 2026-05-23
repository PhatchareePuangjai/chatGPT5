import fs from "node:fs/promises";
import path from "node:path";
import type pg from "pg";

async function ensureMigrationsTable(client: pg.PoolClient) {
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"
  );
}

export async function runMigrations(client: pg.PoolClient, migrationsDirAbs: string) {
  await ensureMigrationsTable(client);

  const entries = await fs.readdir(migrationsDirAbs, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith(".sql"))
    .map((e) => e.name)
    .sort();

  for (const filename of files) {
    const id = filename;
    const already = await client.query("SELECT 1 FROM schema_migrations WHERE id = $1", [id]);
    if (already.rowCount && already.rowCount > 0) continue;

    const sql = await fs.readFile(path.join(migrationsDirAbs, filename), "utf-8");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [id]);
  }
}
