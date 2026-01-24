const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function runSeeds() {
  const dir = path.resolve(__dirname, '../../db/seeds');
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Running seed: ${file}`);
    await pool.query(sql);
  }
}

runSeeds()
  .then(() => {
    console.log('Seeding complete');
    return pool.end();
  })
  .catch((err) => {
    console.error('Seeding failed', err);
    pool.end(() => process.exit(1));
  });
