import { query } from '../../db/index.js';

export type CouponRow = {
  code: string;
  status: 'active' | 'disabled';
  valid_from: string | null;
  valid_until: string | null;
  min_spend_amount: number;
  discount_type: 'fixed_amount' | 'percent';
  discount_value: number;
  per_user_limit: number | null;
};

export async function findCouponByCode(code: string): Promise<CouponRow | null> {
  const rows = await query<CouponRow>(
    'select * from coupons where code = $1',
    [code.toUpperCase()],
  );
  return rows[0] ?? null;
}
