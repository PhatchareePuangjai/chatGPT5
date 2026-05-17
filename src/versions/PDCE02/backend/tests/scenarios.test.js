const assert = require('node:assert/strict');
const test = require('node:test');

const coupons = new Map();

function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

function yesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}

function resetCoupons() {
  coupons.clear();
  coupons.set('SAVE100', {
    code: 'SAVE100',
    discount_type: 'FLAT',
    discount_value: 100,
    expiration_date: futureDate(),
    is_active: true
  });
  coupons.set('DISCOUNT10', {
    code: 'DISCOUNT10',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    expiration_date: futureDate(),
    is_active: true
  });
  coupons.set('EXPIRED', {
    code: 'EXPIRED',
    discount_type: 'FLAT',
    discount_value: 100,
    expiration_date: yesterday(),
    is_active: true
  });
  coupons.set('WELCOME', {
    code: 'WELCOME',
    discount_type: 'FLAT',
    discount_value: 100,
    expiration_date: futureDate(),
    is_active: true
  });
}

const mockPool = {
  query: async (sql, params) => {
    const code = String(params[0]).toUpperCase();
    const coupon = coupons.get(code);
    return { rows: coupon && coupon.is_active ? [coupon] : [] };
  }
};

const dbPath = require.resolve('../db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: mockPool
};

const { validateCoupons } = require('../controllers/couponController');
const applyDiscounts = require('../utils/discountCalculator');

function invokeValidateCoupons(body) {
  return new Promise(resolve => {
    const req = { body };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ statusCode: this.statusCode, body: payload });
      }
    };

    validateCoupons(req, res);
  });
}

test.beforeEach(() => {
  resetCoupons();
});

test('Scenario 1: applies SAVE100 coupon to 1000 total and returns 900', async () => {
  const res = await invokeValidateCoupons({
    userId: 'user-1',
    cartTotal: 1000,
    couponCodes: ['SAVE100']
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.originalTotal, 1000);
  assert.equal(res.body.finalTotal, 900);
  assert.deepEqual(res.body.appliedCoupons, ['SAVE100']);
});

test('Scenario 2: applies 10 percent cart discount to 2000 total and returns 1800', async () => {
  const res = await invokeValidateCoupons({
    userId: 'user-1',
    cartTotal: 2000,
    couponCodes: ['DISCOUNT10']
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.finalTotal, 1800);
  assert.deepEqual(res.body.appliedCoupons, ['DISCOUNT10']);
});

test('Scenario 3: rejects expired coupons without changing the total', async () => {
  const res = await invokeValidateCoupons({
    userId: 'user-1',
    cartTotal: 1000,
    couponCodes: ['EXPIRED']
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'No valid coupons applied');
  assert.equal('finalTotal' in res.body, false);
});

test(
  'Edge 1: coupon usage limit is not implemented in PDCE02',
  { todo: 'No usage history table, query, or endpoint exists for one-use-per-user coupon enforcement.' },
  async () => {
    const first = await invokeValidateCoupons({
      userId: 'user-1',
      cartTotal: 500,
      couponCodes: ['WELCOME']
    });
    const second = await invokeValidateCoupons({
      userId: 'user-1',
      cartTotal: 500,
      couponCodes: ['WELCOME']
    });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 400);
  }
);

test('Edge 2: applies percentage discounts before flat discounts', async () => {
  const res = await invokeValidateCoupons({
    userId: 'user-1',
    cartTotal: 1000,
    couponCodes: ['DISCOUNT10', 'SAVE100']
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.finalTotal, 800);
  assert.deepEqual(res.body.appliedCoupons, ['DISCOUNT10', 'SAVE100']);
});

test('Edge 3: clamps negative totals to zero', () => {
  const finalTotal = applyDiscounts(50, [
    {
      code: 'WELCOME',
      discount_type: 'FLAT',
      discount_value: 100,
      expiration_date: futureDate(),
      is_active: true
    }
  ]);

  assert.equal(finalTotal, 0);
});
