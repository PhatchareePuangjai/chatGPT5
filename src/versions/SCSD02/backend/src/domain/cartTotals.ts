import { mulMoneyMinor, type MoneyMinor } from './money.js';

export type CartItem = {
  sku: string;
  unitPriceMinor: MoneyMinor;
  qty: number;
};

export type CartItemWithTotals = CartItem & {
  lineTotalMinor: MoneyMinor;
};

export function computeLineTotal(item: CartItem): MoneyMinor {
  if (!Number.isInteger(item.qty) || item.qty < 0) throw new Error(`Invalid qty: ${item.qty}`);
  return mulMoneyMinor(item.unitPriceMinor, item.qty);
}

export function computeCartTotals(items: CartItem[]): {
  items: CartItemWithTotals[];
  grandTotalMinor: MoneyMinor;
} {
  const withTotals: CartItemWithTotals[] = items.map((it) => ({
    ...it,
    lineTotalMinor: computeLineTotal(it),
  }));
  const grandTotalMinor = withTotals.reduce((sum, it) => sum + it.lineTotalMinor, 0);
  return { items: withTotals, grandTotalMinor };
}

