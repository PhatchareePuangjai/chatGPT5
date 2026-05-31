import { clampMin, Money, money, percentOf, subtract } from '../../lib/money.js';
import { DISCOUNT_ORDER } from './discountOrder.js';

export type DiscountKind = 'coupon' | 'promotion';

export type DiscountLine = Readonly<{
  kind: DiscountKind;
  label: string;
  amount: Money; // positive reduction
}>;

export type PricingBreakdown = Readonly<{
  subtotal: Money;
  discount_lines: DiscountLine[];
  grand_total: Money;
}>;

export type PercentDiscount = Readonly<{ kind: DiscountKind; label: string; percent: number }>;
export type FixedDiscount = Readonly<{ kind: DiscountKind; label: string; amount: Money }>;

export function priceCart(params: {
  subtotal: Money;
  percentDiscounts?: PercentDiscount[];
  fixedDiscounts?: FixedDiscount[];
}): PricingBreakdown {
  const subtotal = params.subtotal;
  const percentDiscounts = params.percentDiscounts ?? [];
  const fixedDiscounts = params.fixedDiscounts ?? [];

  const discountLines: DiscountLine[] = [];
  let runningTotal = subtotal;

  if (DISCOUNT_ORDER.percentThenFixed !== 'percentThenFixed') {
    throw new Error('Unsupported discount order');
  }

  for (const d of percentDiscounts) {
    const amount = percentOf(runningTotal, d.percent);
    if (amount.amount <= 0) continue;
    discountLines.push({ kind: d.kind, label: d.label, amount });
    runningTotal = subtract(runningTotal, amount);
  }

  for (const d of fixedDiscounts) {
    if (d.amount.amount <= 0) continue;
    discountLines.push({ kind: d.kind, label: d.label, amount: d.amount });
    runningTotal = subtract(runningTotal, d.amount);
  }

  const grandTotal = clampMin(runningTotal, 0);
  return {
    subtotal,
    discount_lines: discountLines,
    grand_total: money(subtotal.currency, grandTotal.amount)
  };
}
