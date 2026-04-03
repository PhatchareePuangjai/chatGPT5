const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function runMigrations() {
  const dir = path.resolve(__dirname, '../../db/migrations');
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }
}

runMigrations()
  .then(() => {
    console.log('Migrations complete');
    return pool.end();
  })
  .catch((err) => {
    console.error('Migration failed', err);
    pool.end(() => process.exit(1));
  });
