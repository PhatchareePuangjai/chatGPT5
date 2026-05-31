import { describe, expect, it } from 'vitest';
import { money } from '../../src/lib/money.js';
import { priceCart } from '../../src/services/pricing/pricingEngine.js';
describe('discount order', () => {
    it('applies percent then fixed: (1000 - 10%) - 100 = 800', () => {
        const pricing = priceCart({
            subtotal: money('THB', 100_000),
            percentDiscounts: [{ kind: 'promotion', label: '10% promo', percent: 10 }],
            fixedDiscounts: [{ kind: 'coupon', label: '100 off', amount: money('THB', 10_000) }],
        });
        expect(pricing.grand_total.amount).toBe(80_000);
    });
});
