// db.js (CommonJS)
const { Pool } = require("pg");

function required(name, value) {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const DB_HOST = required("DB_HOST", process.env.DB_HOST);
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = required("DB_USER", process.env.DB_USER);
const DB_PASSWORD = required("DB_PASSWORD", process.env.DB_PASSWORD);
const DB_NAME = required("DB_NAME", process.env.DB_NAME);

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
});

module.exports = { pool };
