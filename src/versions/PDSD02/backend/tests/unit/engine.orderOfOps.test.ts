import { computeTotals } from '../../src/services/promotions/engine';

describe('Promotion engine order-of-operations', () => {
  it('applies percent first then fixed (1000 THB with 10% + 100 THB => 800 THB)', () => {
    const cart = { cartId: 'c', userId: 'u', currency: 'THB' as const, subtotalSatang: 100000 };
    const promotions = [{ id: 'p', name: '10% off', percentBasisPoints: 1000, isActive: true }];
    const coupon = { id: 'c1', code: 'SAVE100', amountSatang: 10000, minSpendSatang: 0, isActive: true };

    const out = computeTotals({ cart, promotions, coupon });
    expect(out.totals.grandTotalSatang).toBe(80000);
  });
});

