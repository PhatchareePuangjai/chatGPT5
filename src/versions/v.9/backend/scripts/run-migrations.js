const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

const run = async () => {
  const sqlPath = path.join(__dirname, '..', 'sql', '001_inventory_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migrations applied successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
