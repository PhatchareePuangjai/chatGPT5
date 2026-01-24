const { percentOf, clampZero, sumCents } = require('../src/utils/money');

describe('money helpers', () => {
  test('percentOf calculates integer cents deterministically', () => {
    expect(percentOf(200000, 10)).toBe(20000);
  });

  test('clampZero prevents negative totals', () => {
    expect(clampZero(-5000)).toBe(0);
  });

  test('sumCents aggregates arrays safely', () => {
    expect(sumCents([100, 200, 300])).toBe(600);
  });
});
