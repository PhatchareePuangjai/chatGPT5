import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from './dbHarness.js';
import { seedCoupons, seedPromotions } from '../fixtures/seed.js';
import { applyCouponToCart } from '../../src/services/coupons/applyCoupon.js';
describe('invalid coupon code', () => {
    beforeEach(async () => {
        await resetDb();
        await seedCoupons();
        await seedPromotions();
    });
    it('rejects unknown coupon', async () => {
        await expect(applyCouponToCart({ cartId: 'c1000', code: 'NOPE', userId: 'u1' })).rejects.toBeDefined();
    });
});
