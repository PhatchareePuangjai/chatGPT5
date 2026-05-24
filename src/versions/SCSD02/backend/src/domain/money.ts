export type MoneyMinor = number;

export function parseMoneyDisplayToMinor(display: string): MoneyMinor {
  // Accepts "19.99" and converts to 1999. This is a helper for tests/dev only.
  const normalized = display.trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Invalid money display value: ${display}`);
  }
  const [whole, frac = ''] = normalized.split('.');
  const sign = whole.startsWith('-') ? -1 : 1;
  const wholeAbs = Math.abs(Number(whole));
  const frac2 = (frac + '00').slice(0, 2);
  return sign * (wholeAbs * 100 + Number(frac2));
}

export function formatMoneyMinor(minor: MoneyMinor): string {
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, '0');
  return `${sign}${whole}.${frac}`;
}

export function mulMoneyMinor(unitMinor: MoneyMinor, qty: number): MoneyMinor {
  if (!Number.isInteger(qty) || qty < 0) throw new Error(`Invalid qty: ${qty}`);
  return unitMinor * qty;
}

