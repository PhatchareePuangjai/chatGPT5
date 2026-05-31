import { listActivePromotions } from '../../models/promotions/promotionRepo.js';

export type SelectedPromotion = { label: string; percent: number };

export async function listPromotionsForCart(params: { cartSubtotalAmount: number }): Promise<SelectedPromotion[]> {
  const promotions = await listActivePromotions();
  return promotions
    .filter((p) => p.promotion_type === 'cart_total_percent' && p.value > 0)
    .map((p) => ({ label: `${p.value}% cart discount`, percent: p.value }));
}
