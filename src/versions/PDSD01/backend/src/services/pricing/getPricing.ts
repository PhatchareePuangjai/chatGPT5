import { money } from '../../lib/money.js';
import { priceCart } from './pricingEngine.js';
import { listPromotionsForCart } from '../promotions/selectPromotions.js';

const CARTS: Record<string, { subtotal: number }> = {
  c1000: { subtotal: 100_000 },
  c2000: { subtotal: 200_000 },
  c50: { subtotal: 5_000 },
};

export async function getPricingForCart(params: { cartId: string; userId: string | null }) {
  const cart = CARTS[params.cartId] ?? { subtotal: 0 };
  const promotions = await listPromotionsForCart({ cartSubtotalAmount: cart.subtotal });
  const percentDiscounts = promotions.map((p) => ({ kind: 'promotion' as const, label: p.label, percent: p.percent }));
  const pricing = priceCart({ subtotal: money('THB', cart.subtotal), percentDiscounts });
  return { cartId: params.cartId, pricing };
}
