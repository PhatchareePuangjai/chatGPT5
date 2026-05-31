export type CurrencyCode = 'THB';

export type Money = Readonly<{
  currency: CurrencyCode;
  amount: number; // smallest unit (satang) as integer
}>;

export function money(currency: CurrencyCode, amount: number): Money {
  if (!Number.isInteger(amount)) throw new Error('Money.amount must be an integer');
  return { currency, amount };
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.currency, a.amount + b.amount);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.currency, a.amount - b.amount);
}

export function clampMin(a: Money, minAmount: number): Money {
  if (!Number.isInteger(minAmount)) throw new Error('minAmount must be integer');
  return money(a.currency, Math.max(minAmount, a.amount));
}

export function percentOf(base: Money, percent: number): Money {
  if (!Number.isFinite(percent)) throw new Error('percent must be finite');
  // Rounding policy: round to nearest satang.
  const amount = Math.round((base.amount * percent) / 100);
  return money(base.currency, amount);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) throw new Error('Currency mismatch');
}
