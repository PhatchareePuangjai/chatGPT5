import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { pool } from './index.js';

export async function applyMigrations(): Promise<void> {
  const migrationsDir = join(process.cwd(), 'migrations');
  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  await pool.query(
    `create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )`,
  );

  for (const filename of files) {
    const already = await pool.query('select 1 from schema_migrations where filename = $1', [filename]);
    if (already.rowCount && already.rowCount > 0) continue;

    const sql = await readFile(join(migrationsDir, filename), 'utf-8');
    await pool.query('begin');
    try {
      await pool.query(sql);
      await pool.query('insert into schema_migrations (filename) values ($1)', [filename]);
      await pool.query('commit');
      // eslint-disable-next-line no-console
      console.log(`applied ${filename}`);
    } catch (err) {
      await pool.query('rollback');
      throw err;
    }
  }

}

async function main() {
  try {
    await applyMigrations();
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  });
}
