import { query } from '../../db/index.js';

export type PromotionRow = {
  id: string;
  status: 'active' | 'disabled';
  valid_from: string | null;
  valid_until: string | null;
  promotion_type: 'cart_total_percent';
  value: number;
};

export async function listActivePromotions(): Promise<PromotionRow[]> {
  return query<PromotionRow>('select * from promotions where status = $1', ['active']);
}
