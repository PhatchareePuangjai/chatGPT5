import { beforeEach, describe, expect, it } from 'vitest';

import { resetDb } from './dbHarness.js';
import { seedCoupons, seedPromotions } from '../fixtures/seed.js';
import { applyCouponToCart } from '../../src/services/coupons/applyCoupon.js';
import { ApiError } from '../../src/api/errors.js';

describe('apply coupon EXPIRED', () => {
  beforeEach(async () => {
    await resetDb();
    await seedCoupons();
    await seedPromotions();
  });

  it('rejects expired coupon', async () => {
    await expect(applyCouponToCart({ cartId: 'c1000', code: 'EXPIRED', userId: 'u1' })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

