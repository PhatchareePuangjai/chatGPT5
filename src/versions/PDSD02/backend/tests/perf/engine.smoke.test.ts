import { computeTotals } from '../../src/services/promotions/engine';

describe('Promotion engine perf smoke', () => {
  it('computes totals quickly for typical cart sizes (smoke)', () => {
    const cart = { cartId: 'c', userId: 'u', currency: 'THB' as const, subtotalSatang: 200000 };
    const promotions = [{ id: 'p', name: '10% off', percentBasisPoints: 1000, isActive: true }];

    const start = Date.now();
    for (let i = 0; i < 5000; i++) computeTotals({ cart, promotions });
    const elapsedMs = Date.now() - start;

    // Non-flaky smoke bound: should be comfortably fast on dev machines.
    expect(elapsedMs).toBeLessThan(2000);
  });
});

