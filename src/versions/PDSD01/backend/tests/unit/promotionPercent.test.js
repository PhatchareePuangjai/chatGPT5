import { describe, expect, it } from 'vitest';
import { money } from '../../src/lib/money.js';
import { priceCart } from '../../src/services/pricing/pricingEngine.js';
describe('percentage promotion', () => {
    it('calculates 10% of 2,000 THB as 200 THB', () => {
        const pricing = priceCart({
            subtotal: money('THB', 200_000),
            percentDiscounts: [{ kind: 'promotion', label: '10% promo', percent: 10 }],
        });
        expect(pricing.discount_lines[0]?.amount.amount).toBe(20_000);
        expect(pricing.grand_total.amount).toBe(180_000);
    });
});
