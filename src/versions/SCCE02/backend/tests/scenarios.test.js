// Runs against a real PostgreSQL instance, matching every other version.
//
// The previous suite injected a fake `db` module into require.cache (so the
// application's SQL never ran) and asserted two scenarios with regular
// expressions over the source text of the route and controller files, which
// passes whenever a matching string is present regardless of behaviour.
//
// No application code is modified. `db.js` hardcodes host 'db', so this suite
// is executed inside the compose network where that name resolves. The schema
// below is derived from the JOIN in `controllers/cartController.js`, because
// the generated project ships no schema file of its own.
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");

const pool = require("../db");
const cartRoutes = require("../routes/cartRoutes");

const app = express();
app.use(express.json());
app.use("/api/cart", cartRoutes);

const USER = "user-1";

test.before(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE'
    );
  `);
});

test.beforeEach(async () => {
  await pool.query("TRUNCATE cart_items, carts, products RESTART IDENTITY CASCADE");
  await pool.query(`
    INSERT INTO products (id, sku, name, price_cents, stock) VALUES
    (1, 'SKU-001', 'Product A', 10000, 10),
    (5, 'SKU-005', 'Product E', 5000, 5),
    (6, 'SKU-006', 'Product F', 1999, 100)
  `);
  await pool.query("INSERT INTO carts (id, user_id) VALUES (1, $1)", [USER]);
});

test.after(async () => {
  await pool.end();
});

const getCart = () => request(app).get(`/api/cart/${USER}`);

// Scenario 1: Update Item Quantity -----------------------------------------
test("Scenario 1: updating quantity to 3 gives line total 300.00 and grand total 300.00", async () => {
  await pool.query(
    "INSERT INTO cart_items (cart_id, product_id, quantity, status) VALUES (1, 1, 1, 'ACTIVE')"
  );

  // Expected Result 1: the user can change the quantity to 3.
  const updated = await request(app)
    .patch("/api/cart/items/SKU-001")
    .send({ quantity: 3 });
  assert.equal(updated.status, 200);

  const res = await getCart();
  assert.equal(res.status, 200);
  const item = res.body.items.find((i) => i.name === "Product A");
  assert.equal(item.quantity, 3);
  assert.equal(item.lineTotal, 30000);
  assert.equal(res.body.totalCents, 30000);
});

// Scenario 2: Merge Items Logic --------------------------------------------
test("Scenario 2: adding SKU-001 twice merges into one row of quantity 3", async () => {
  const first = await request(app)
    .post("/api/cart/items")
    .send({ userId: USER, sku: "SKU-001", quantity: 1 });
  assert.equal(first.status, 200);

  const second = await request(app)
    .post("/api/cart/items")
    .send({ userId: USER, sku: "SKU-001", quantity: 2 });
  assert.equal(second.status, 200);

  const res = await getCart();
  const rows = res.body.items.filter((i) => i.name === "Product A");
  // Expected Result 1: no duplicate rows. Expected Result 2: 1 + 2 = 3.
  assert.equal(rows.length, 1);
  assert.equal(rows[0].quantity, 3);
});

// Scenario 3: Save for Later ------------------------------------------------
test("Scenario 3: saving SKU-005 removes it from the active total and keeps it as SAVED", async () => {
  await pool.query(
    "INSERT INTO cart_items (cart_id, product_id, quantity, status) VALUES (1, 5, 1, 'ACTIVE')"
  );

  const saved = await request(app)
    .post("/api/cart/items/SKU-005/save")
    .send({ userId: USER });
  assert.equal(saved.status, 200);

  const res = await getCart();
  const item = res.body.items.find((i) => i.name === "Product E");
  // Expected Result 3: the item moves to the Saved list.
  assert.equal(item.status, "SAVED");
  // Expected Result 2: the active total drops by its price.
  assert.equal(res.body.totalCents, 0);
});

// Edge 1: Add More Than Stock ----------------------------------------------
test("Edge 1: adding 3 more of SKU-005 when 3 of 5 are in the cart is rejected", async () => {
  await pool.query(
    "INSERT INTO cart_items (cart_id, product_id, quantity, status) VALUES (1, 5, 3, 'ACTIVE')"
  );

  const res = await request(app)
    .post("/api/cart/items")
    .send({ userId: USER, sku: "SKU-005", quantity: 3 });

  // Expected Result: rejected, and the cart stays at 3.
  assert.equal(res.status, 409);

  const cart = await getCart();
  const item = cart.body.items.find((i) => i.name === "Product E");
  assert.equal(item.quantity, 3);
});

// Edge 2: Floating Point Calculation ---------------------------------------
test("Edge 2: 19.99 x 3 totals exactly 59.97", async () => {
  await pool.query(
    "INSERT INTO cart_items (cart_id, product_id, quantity, status) VALUES (1, 6, 3, 'ACTIVE')"
  );

  const res = await getCart();
  assert.equal(res.status, 200);
  assert.equal(res.body.totalCents, 5997);
});
