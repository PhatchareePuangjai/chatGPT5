import { describe, expect, test } from 'vitest';
import { formatCurrencyFromCents } from './format.js';

describe('formatCurrencyFromCents', () => {
  test('formats baht values with two decimals', () => {
    expect(formatCurrencyFromCents(10000)).toBe('฿100.00');
  });
});
