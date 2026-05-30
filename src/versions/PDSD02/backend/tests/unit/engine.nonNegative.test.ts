import { computeTotals } from '../../src/services/promotions/engine';

describe('Promotion engine non-negative protection', () => {
  it('clamps grand total to 0 when discounts exceed subtotal', () => {
    const cart = { cartId: 'c', userId: 'u', currency: 'THB' as const, subtotalSatang: 5000 };
    const promotions: any[] = [];
    const coupon = { id: 'c1', code: 'BIG', amountSatang: 10000, minSpendSatang: 0, isActive: true };

    const out = computeTotals({ cart, promotions, coupon });
    expect(out.totals.grandTotalSatang).toBe(0);
  });
});

