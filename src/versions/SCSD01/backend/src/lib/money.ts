export type MoneyMinor = number;

export function toMinorUnits(amount: number): MoneyMinor {
  // Convert a decimal to minor units using rounding to nearest cent.
  // This is intended for inputs already at 2 decimals; core calculations should stay in minor units.
  return Math.round(amount * 100);
}

export function fromMinorUnits(amountMinor: MoneyMinor): string {
  const sign = amountMinor < 0 ? '-' : '';
  const abs = Math.abs(amountMinor);
  const dollars = Math.floor(abs / 100);
  const cents = abs % 100;
  return `${sign}${dollars}.${String(cents).padStart(2, '0')}`;
}

export function multiplyMinor(unitPriceMinor: MoneyMinor, qty: number): MoneyMinor {
  if (!Number.isInteger(qty) || qty < 0) throw new Error('qty must be integer >= 0');
  return unitPriceMinor * qty;
}

export function sumMinor(values: MoneyMinor[]): MoneyMinor {
  return values.reduce((acc, v) => acc + v, 0);
}

