import { readFile } from 'node:fs/promises';
import { withClient } from './db.js';

export async function applyMigrations(): Promise<void> {
  const sql = await readFile(new URL('../models/schema.sql', import.meta.url), 'utf-8');
  await withClient(async (client) => {
    await client.query(sql);
  });
}

