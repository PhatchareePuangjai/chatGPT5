
const { Pool } = require('pg');

const pool = new Pool({
  host: 'db',
  user: 'postgres',
  password: 'postgres',
  database: 'cartdb',
  port: 5432
});

module.exports = pool;
