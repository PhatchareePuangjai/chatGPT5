import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from './dbHarness.js';
import { seedPromotions } from '../fixtures/seed.js';
import { getPricingForCart } from '../../src/services/pricing/getPricing.js';
describe('cart percent promo', () => {
    beforeEach(async () => {
        await resetDb();
        await seedPromotions();
    });
    it('applies 10% promo to 2,000 THB cart', async () => {
        const result = await getPricingForCart({ cartId: 'c2000', userId: 'u1' });
        expect(result.pricing.discount_lines[0]?.amount.amount).toBe(20_000);
        expect(result.pricing.grand_total.amount).toBe(180_000);
    });
});
