// Runs against a real PostgreSQL instance, matching every other version.
// (Previously this suite injected a hand-written `mockPool` into require.cache,
// so the application's SQL was never executed.)
//
// No application code is modified: `db.js` already reads DB_HOST / DB_USER /
// DB_PASSWORD / DB_NAME from the environment, and the schema below is the
// project's own `backend/schema.sql`.
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.DB_NAME = process.env.DB_NAME || 'promotionsdb';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const pool = require('../db');
const couponRoutes = require('../routes/couponRoutes');

const app = express();
app.use(express.json());
app.use('/api/coupons', couponRoutes);

const USER = 'user-1';

// Coupon fixtures required by scenarios_promotions.md, expressed with the
// schema the application itself defines.
const COUPONS = [
  // Scenario 1 / Edge 3: 100 THB off
  ['SAVE100', 'FLAT', 100, "NOW() + INTERVAL '30 days'"],
  // Scenario 2 / Edge 2: 10% off
  ['DISCOUNT10', 'PERCENTAGE', 10, "NOW() + INTERVAL '30 days'"],
  // Scenario 3: expired yesterday
  ['EXPIRED', 'FLAT', 100, "NOW() - INTERVAL '1 day'"],
  // Edge 1: one use per user
  ['WELCOME', 'FLAT', 100, "NOW() + INTERVAL '30 days'"],
];

test.before(async () => {
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_type VARCHAR(20) CHECK (discount_type IN ('PERCENTAGE','FLAT')),
      discount_value NUMERIC(10,2) NOT NULL,
      expiration_date TIMESTAMP NOT NULL,
      is_active BOOLEAN DEFAULT TRUE
    );
  `);
});

test.beforeEach(async () => {
  await pool.query('DELETE FROM coupons');
  for (const [code, type, value, expires] of COUPONS) {
    await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, expiration_date, is_active)
       VALUES ($1, $2, $3, ${expires}, TRUE)`,
      [code, type, value]
    );
  }
});

test.after(async () => {
  await pool.end();
});

const validate = (body) =>
  request(app).post('/api/coupons/validate').send(body);

// Scenario 1: Coupon Validation -------------------------------------------
test('Scenario 1: SAVE100 on a 1000 cart requires a 500 minimum and yields 900', async () => {
  const res = await validate({ userId: USER, cartTotal: 1000, couponCodes: ['SAVE100'] });

  assert.equal(res.status, 200);
  assert.equal(res.body.finalTotal, 900);
  assert.deepEqual(res.body.appliedCoupons, ['SAVE100']);

  // Expected Result 1: the minimum-purchase condition must be enforced.
  const below = await validate({ userId: USER, cartTotal: 400, couponCodes: ['SAVE100'] });
  assert.equal(below.status, 400);
});

// Scenario 2: Cart Total Discount % ----------------------------------------
test('Scenario 2: 10 percent off a 2000 cart yields 1800', async () => {
  const res = await validate({ userId: USER, cartTotal: 2000, couponCodes: ['DISCOUNT10'] });

  assert.equal(res.status, 200);
  assert.equal(res.body.originalTotal, 2000);
  assert.equal(res.body.finalTotal, 1800);
});

// Scenario 3: Expiration Date Check ----------------------------------------
test('Scenario 3: expired coupon is rejected and the total is unchanged', async () => {
  const res = await validate({ userId: USER, cartTotal: 1000, couponCodes: ['EXPIRED'] });

  assert.equal(res.status, 400);
  assert.match(String(res.body.message), /no valid coupons/i);
});

// Edge 1: Coupon Usage Limit ------------------------------------------------
test('Edge 1: WELCOME may be used once per user; the second order is rejected', async () => {
  const first = await validate({ userId: USER, cartTotal: 1000, couponCodes: ['WELCOME'] });
  assert.equal(first.status, 200);
  assert.equal(first.body.finalTotal, 900);

  // Expected Result: usage history must be looked up and the reuse refused.
  const second = await validate({ userId: USER, cartTotal: 1000, couponCodes: ['WELCOME'] });
  assert.equal(second.status, 400);
});

// Edge 2: Order of Operations ----------------------------------------------
test('Edge 2: percentage applies before flat: (1000 - 10%) - 100 = 800', async () => {
  const res = await validate({
    userId: USER,
    cartTotal: 1000,
    couponCodes: ['DISCOUNT10', 'SAVE100'],
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.finalTotal, 800);
});

// Edge 3: Negative Total Protection ----------------------------------------
test('Edge 3: a 100 coupon on a 50 cart clamps to 0, never negative', async () => {
  const res = await validate({ userId: USER, cartTotal: 50, couponCodes: ['SAVE100'] });

  assert.equal(res.status, 200);
  assert.equal(res.body.finalTotal, 0);
});
