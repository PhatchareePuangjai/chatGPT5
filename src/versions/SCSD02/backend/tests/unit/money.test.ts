import { describe, expect, it } from 'vitest';
import { formatMoneyMinor, mulMoneyMinor, parseMoneyDisplayToMinor } from '../../src/domain/money.js';

describe('money', () => {
  it('parses and formats minor units deterministically', () => {
    expect(parseMoneyDisplayToMinor('19.99')).toBe(1999);
    expect(formatMoneyMinor(1999)).toBe('19.99');
    expect(formatMoneyMinor(0)).toBe('0.00');
  });

  it('multiplies money using integers (19.99 * 3 = 59.97)', () => {
    const unit = parseMoneyDisplayToMinor('19.99');
    const total = mulMoneyMinor(unit, 3);
    expect(total).toBe(5997);
    expect(formatMoneyMinor(total)).toBe('59.97');
  });
});

