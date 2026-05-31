import { query } from '../../db/index.js';

export async function countRedemptionsForUser(params: {
  userId: string;
  couponCode: string;
}): Promise<number> {
  const rows = await query<{ count: string }>(
    'select count(*)::text as count from coupon_redemptions where user_id = $1 and coupon_code = $2',
    [params.userId, params.couponCode.toUpperCase()],
  );
  return Number.parseInt(rows[0]?.count ?? '0', 10);
}
