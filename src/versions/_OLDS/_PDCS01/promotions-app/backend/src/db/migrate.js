const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDb({ retries = 30, delayMs = 1000 } = {}) {
  // eslint-disable-next-line no-console
  console.log('Waiting for database...');
  for (let i = 0; i < retries; i += 1) {
    try {
      await pool.query('SELECT 1');
      // eslint-disable-next-line no-console
      console.log('Database is ready');
      return;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`DB not ready yet (${i + 1}/${retries})`);
      await sleep(delayMs);
    }
  }
  throw new Error('Database did not become ready in time');
}

async function runMigrations() {
  await waitForDb();

  const dir = path.resolve(__dirname, '../../db/migrations');
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }
}

runMigrations()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Migrations complete');
    return pool.end();
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Migration failed', err);
    pool.end(() => process.exit(1));
  });

