import { clampNonNegative, percentDiscountSatang } from '../../lib/money';
import type { CartSnapshot, Coupon, DiscountLine, Promotion, Totals } from './types';

export type EngineInput = {
  cart: CartSnapshot;
  promotions: Promotion[];
  coupon?: Coupon;
};

export type EngineOutput = {
  totals: Totals;
  discountLines: DiscountLine[];
};

export function computeTotals(input: EngineInput): EngineOutput {
  const discountLines: DiscountLine[] = [];
  const subtotal = input.cart.subtotalSatang;
  let discountTotal = 0;

  // 1) cart-level percent promotions (order = 1)
  for (const promo of input.promotions) {
    if (!promo.isActive) continue;
    const amount = percentDiscountSatang(subtotal, promo.percentBasisPoints);
    if (amount <= 0) continue;
    discountLines.push({
      type: 'PROMOTION',
      label: `${promo.name}`,
      amountSatang: amount,
      order: 1,
    });
    discountTotal += amount;
  }

  // 2) fixed-amount coupon (order = 2), capped by remaining
  if (input.coupon && input.coupon.isActive) {
    const remaining = clampNonNegative(subtotal - discountTotal);
    const amount = Math.min(remaining, input.coupon.amountSatang);
    if (amount > 0) {
      discountLines.push({
        type: 'COUPON',
        label: `Coupon ${input.coupon.code}`,
        amountSatang: amount,
        order: 2,
      });
      discountTotal += amount;
    }
  }

  const grandTotal = clampNonNegative(subtotal - discountTotal);

  return {
    totals: {
      currency: input.cart.currency,
      subtotalSatang: subtotal,
      discountTotalSatang: discountTotal,
      grandTotalSatang: grandTotal,
    },
    discountLines: discountLines.sort((a, b) => a.order - b.order),
  };
}

