import { beforeEach, describe, expect, it } from 'vitest';

import { resetDb } from './dbHarness.js';
import { seedCoupons, seedPromotions } from '../fixtures/seed.js';
import { pool } from '../../src/db/index.js';
import { applyCouponToCart } from '../../src/services/coupons/applyCoupon.js';
import { ApiError } from '../../src/api/errors.js';

describe('coupon usage limit', () => {
  beforeEach(async () => {
    await resetDb();
    await seedCoupons();
    await seedPromotions();

    await pool.query(
      `insert into coupon_redemptions (user_id, coupon_code, order_id) values ($1, $2, $3)`,
      ['u1', 'WELCOME', 'order_1'],
    );
  });

  it('rejects WELCOME second use for the same user', async () => {
    await expect(applyCouponToCart({ cartId: 'c1000', code: 'WELCOME', userId: 'u1' })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

