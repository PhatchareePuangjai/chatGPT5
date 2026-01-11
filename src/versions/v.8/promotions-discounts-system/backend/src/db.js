const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });

pool.on("error", (err) => {
  console.error("Unexpected PG client error", err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
