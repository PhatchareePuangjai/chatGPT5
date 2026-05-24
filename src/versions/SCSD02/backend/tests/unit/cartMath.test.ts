import { describe, expect, it } from 'vitest';
import { computeCartTotals } from '../../src/domain/cartTotals.js';
import { parseMoneyDisplayToMinor } from '../../src/domain/money.js';

describe('cartTotals', () => {
  it('recomputes line totals and grand total', () => {
    const unit = parseMoneyDisplayToMinor('100.00');
    const { items, grandTotalMinor } = computeCartTotals([{ sku: 'A', unitPriceMinor: unit, qty: 3 }]);
    expect(items).toHaveLength(1);
    expect(items[0]!.lineTotalMinor).toBe(30000);
    expect(grandTotalMinor).toBe(30000);
  });
});

