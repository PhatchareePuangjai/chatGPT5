const { query } = require("./db");

async function migrateAndSeed() {
  // Tables
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_satang INTEGER NOT NULL CHECK (price_satang >= 0),
      stock INTEGER NOT NULL CHECK (stock >= 0)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS coupon_usage (
      user_id TEXT NOT NULL,
      coupon_code TEXT NOT NULL,
      used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
      PRIMARY KEY (user_id, coupon_code)
    );
  `);

  // Seed products if empty
  const { rows } = await query(`SELECT COUNT(*)::int AS c FROM products;`);
  const count = rows?.[0]?.c ?? 0;

  if (count === 0) {
    await query(`
      INSERT INTO products (id, name, price_satang, stock) VALUES
      ('A', 'Item A', 10000, 20),
      ('B', 'Item B', 25000, 10),
      ('C', 'Item C',  5000,  3),
      ('D', 'Item D', 75000,  5);
    `);
  }
}

module.exports = { migrateAndSeed };
