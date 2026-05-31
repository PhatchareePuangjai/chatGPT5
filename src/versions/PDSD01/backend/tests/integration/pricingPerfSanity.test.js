import { describe, expect, it } from 'vitest';
import { money } from '../../src/lib/money.js';
import { priceCart } from '../../src/services/pricing/pricingEngine.js';
describe('pricing perf sanity', () => {
    it('prices a cart quickly in-process', () => {
        const start = performance.now();
        for (let i = 0; i < 5_000; i += 1) {
            priceCart({
                subtotal: money('THB', 200_000),
                percentDiscounts: [{ kind: 'promotion', label: '10% promo', percent: 10 }],
            });
        }
        const elapsedMs = performance.now() - start;
        expect(elapsedMs).toBeLessThan(500);
    });
});
