const request = require('supertest');
const app = require('../src/app');
const { pool, query } = require('../src/db/pool');

describe('Promotions and Discounts Scenarios (PDCS01)', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await query('TRUNCATE carts, coupons, cart_discounts, coupon_usages, promotion_events RESTART IDENTITY CASCADE');

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await query(
      `
        INSERT INTO coupons (code, type, value_cents, value_percent, min_subtotal_cents, start_at, end_at, usage_limit_per_user) VALUES
        ('SAVE100', 'fixed',   10000, 0,  50000, $1, $2, 100),
        ('CART10',  'percent', 0,     10, 0,     $1, $2, 100),
        ('EXPIRED', 'fixed',   10000, 0,  0,     $3, $4, 100),
        ('WELCOME', 'fixed',   10000, 0,  0,     $1, $2, 1)
      `,
      [yesterday.toISOString(), tomorrow.toISOString(), twoDaysAgo.toISOString(), yesterday.toISOString()]
    );
  });

  test('1) Coupon Validation: Min purchase 500, Save 100', async () => {
    const userId = 'user1';
    await query('INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)', [userId, 100000]);

    const res = await request(app).post('/api/promotions/apply').send({ userId, couponCode: 'SAVE100' }).expect(200);

    expect(res.body.applied_discount_cents).toBe(10000);
    expect(res.body.cart.subtotal_cents).toBe(100000);
    expect(res.body.cart.discount_total_cents).toBe(10000);
    expect(res.body.cart.grand_total_cents).toBe(90000);
  });

  test('2) Cart Total Discount %: 10% off', async () => {
    const userId = 'user1';
    await query('INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)', [userId, 200000]);

    const res = await request(app).post('/api/promotions/apply').send({ userId, couponCode: 'CART10' }).expect(200);

    expect(res.body.applied_discount_cents).toBe(20000);
    expect(res.body.cart.discount_total_cents).toBe(20000);
    expect(res.body.cart.grand_total_cents).toBe(180000);
  });

  test('3) Expiration Date Check', async () => {
    const userId = 'user1';
    await query('INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)', [userId, 100000]);

    const res = await request(app).post('/api/promotions/apply').send({ userId, couponCode: 'EXPIRED' });

    expect(res.status).not.toBe(200);
    expect(res.body.error).toMatch(/expired|หมดอายุ/i);

    const cartRes = await request(app).get(`/api/cart?userId=${userId}`).expect(200);
    expect(cartRes.body.discount_total_cents).toBe(0);
  });

  test('Edge 1) Coupon Usage Limit', async () => {
    const userId = 'user1';
    await query('INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)', [userId, 50000]);

    await request(app).post('/api/promotions/apply').send({ userId, couponCode: 'WELCOME' }).expect(200);

    await query('DELETE FROM cart_discounts WHERE coupon_code = $1', ['WELCOME']);

    const res = await request(app).post('/api/promotions/apply').send({ userId, couponCode: 'WELCOME' }).expect(400);

    expect(JSON.stringify(res.body)).toMatch(/limit|ครบ|เต็ม/i);
  });

  test('Edge 2) Order of Operations: 10% then 100 baht', async () => {
    const userId = 'user1';
    await query('INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)', [userId, 100000]);

    await request(app).post('/api/promotions/apply').send({ userId, couponCode: 'CART10' }).expect(200);

    const res = await request(app).post('/api/promotions/apply').send({ userId, couponCode: 'SAVE100' }).expect(200);

    expect(res.body.cart.discount_total_cents).toBe(20000);
    expect(res.body.cart.grand_total_cents).toBe(80000);
  });

  test('Edge 3) Negative Total Protection', async () => {
    const userId = 'user2';
    await query('INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)', [userId, 5000]);

    const res = await request(app).post('/api/promotions/apply').send({ userId, couponCode: 'WELCOME' }).expect(200);

    expect(res.body.cart.grand_total_cents).toBe(0);
  });
});

