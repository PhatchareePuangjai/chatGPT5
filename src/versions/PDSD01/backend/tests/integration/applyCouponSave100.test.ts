import { beforeEach, describe, expect, it } from 'vitest';

import { resetDb } from './dbHarness.js';
import { seedCoupons } from '../fixtures/seed.js';
import { applyCouponToCart } from '../../src/services/coupons/applyCoupon.js';

describe('apply coupon SAVE100', () => {
  beforeEach(async () => {
    await resetDb();
    await seedCoupons();
  });

  it('reduces 1,000 THB cart to 900 THB and returns success message', async () => {
    const result = await applyCouponToCart({ cartId: 'c1000', code: 'SAVE100', userId: 'u1' });
    expect(result.status).toBe('applied');
    expect(result.message).toBe('ใช้คูปองสำเร็จ');
    expect(result.pricing.subtotal.amount).toBe(100_000);
    expect(result.pricing.grand_total.amount).toBe(90_000);
  });
});

