import { describe, expect, it } from 'vitest';
import { multiplyMinor, fromMinorUnits } from '../../src/lib/money.js';

describe('money', () => {
  it('computes 100.00 * 3 = 300.00 exactly in minor units', () => {
    const unit = 10000; // 100.00
    const total = multiplyMinor(unit, 3);
    expect(fromMinorUnits(total)).toBe('300.00');
  });

  it('computes 19.99 * 3 = 59.97 exactly in minor units', () => {
    const unit = 1999; // 19.99
    const total = multiplyMinor(unit, 3);
    expect(fromMinorUnits(total)).toBe('59.97');
  });
});

