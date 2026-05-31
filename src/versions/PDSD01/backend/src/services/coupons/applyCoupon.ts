import { money } from '../../lib/money.js';
import { priceCart } from '../pricing/pricingEngine.js';
import { validateCoupon } from './validateCoupon.js';
import { listPromotionsForCart } from '../promotions/selectPromotions.js';

const CARTS: Record<string, { subtotal: number; appliedCouponCode: string | null }> = {
  // seeded demo carts (satang)
  c1000: { subtotal: 100_000, appliedCouponCode: null },
  c2000: { subtotal: 200_000, appliedCouponCode: null },
  c50: { subtotal: 5_000, appliedCouponCode: null },
};

function todayISODate(): string {
  const tz = process.env.STORE_TIMEZONE ?? 'UTC';
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date());
  return date; // YYYY-MM-DD
}

export async function applyCouponToCart(params: { cartId: string; code: string; userId: string | null }) {
  const cart = CARTS[params.cartId] ?? { subtotal: 0, appliedCouponCode: null };

  const validated = await validateCoupon({
    code: params.code,
    cartSubtotalAmount: cart.subtotal,
    userId: params.userId,
    todayISODate: todayISODate(),
  });

  cart.appliedCouponCode = validated.code;
  CARTS[params.cartId] = cart;

  const promotions = await listPromotionsForCart({ cartSubtotalAmount: cart.subtotal });

  const percentDiscounts = promotions.map((p) => ({ kind: 'promotion' as const, label: p.label, percent: p.percent }));
  const fixedDiscounts =
    validated.kind === 'fixed'
      ? [{ kind: 'coupon' as const, label: validated.code, amount: money('THB', validated.value) }]
      : [];
  const percentFromCoupon =
    validated.kind === 'percent'
      ? [{ kind: 'coupon' as const, label: validated.code, percent: validated.value }]
      : [];

  const pricing = priceCart({
    subtotal: money('THB', cart.subtotal),
    percentDiscounts: [...percentDiscounts, ...percentFromCoupon],
    fixedDiscounts,
  });

  return { status: 'applied', message: 'ใช้คูปองสำเร็จ', pricing };
}

export async function removeCouponFromCart(params: { cartId: string }) {
  const cart = CARTS[params.cartId] ?? { subtotal: 0, appliedCouponCode: null };
  cart.appliedCouponCode = null;
  CARTS[params.cartId] = cart;

  const promotions = await listPromotionsForCart({ cartSubtotalAmount: cart.subtotal });
  const percentDiscounts = promotions.map((p) => ({ kind: 'promotion' as const, label: p.label, percent: p.percent }));
  const pricing = priceCart({ subtotal: money('THB', cart.subtotal), percentDiscounts });

  return { status: 'removed', pricing };
}
