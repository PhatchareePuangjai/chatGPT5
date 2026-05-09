const { __testables } = require('../src/services/promotionService');

describe('promotion service helpers', () => {
  test('determinePriority favors percent discounts', () => {
    expect(__testables.determinePriority({ type: 'percent' })).toBe(1);
    expect(__testables.determinePriority({ type: 'fixed' })).toBe(2);
    expect(__testables.determinePriority({ type: 'fixed', priority_override: 99 })).toBe(99);
  });

  test('computeDiscountAmount covers percent and fixed values', () => {
    const cart = { subtotal_cents: 100000 };
    expect(__testables.computeDiscountAmount(cart, { type: 'percent', value_percent: 10 })).toBe(10000);
    expect(__testables.computeDiscountAmount(cart, { type: 'fixed', value_cents: 2500 })).toBe(2500);
  });
});
