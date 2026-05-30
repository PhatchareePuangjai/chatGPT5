export type Money = {
  currency: 'THB';
  amountSatang: number;
};

export function assertNonNegativeInteger(value: number, name: string) {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a non-negative integer`);
}

export function clampNonNegative(value: number): number {
  return value < 0 ? 0 : value;
}

export function percentDiscountSatang(subtotalSatang: number, basisPoints: number): number {
  assertNonNegativeInteger(subtotalSatang, 'subtotalSatang');
  assertNonNegativeInteger(basisPoints, 'basisPoints');
  if (basisPoints > 10000) throw new Error('basisPoints must be <= 10000');

  // half-up rounding: (subtotal * bp / 10000)
  const numerator = subtotalSatang * basisPoints;
  return Math.floor((numerator + 5000) / 10000);
}

