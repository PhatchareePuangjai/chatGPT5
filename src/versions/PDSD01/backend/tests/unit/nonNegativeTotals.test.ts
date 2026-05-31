import { describe, expect, it } from 'vitest';

import { money } from '../../src/lib/money.js';
import { priceCart } from '../../src/services/pricing/pricingEngine.js';

describe('non-negative totals', () => {
  it('clamps grand total to 0', () => {
    const pricing = priceCart({
      subtotal: money('THB', 5_000),
      fixedDiscounts: [{ kind: 'coupon', label: 'too much', amount: money('THB', 10_000) }],
    });
    expect(pricing.grand_total.amount).toBe(0);
  });
});

