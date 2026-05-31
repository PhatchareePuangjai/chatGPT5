import { ApiErrorCode } from '../../api/errors.js';

export type CouponLike = {
  code: string;
  status: 'active' | 'disabled';
  valid_until: string | null; // YYYY-MM-DD
  min_spend_amount: number;
  discount_type: 'fixed_amount' | 'percent';
  discount_value: number;
  per_user_limit: number | null;
};

export type EligibilityResult =
  | { ok: true }
  | { ok: false; code: ApiErrorCode; message: string };

export function evaluateCouponEligibility(params: {
  coupon: CouponLike | null;
  cartSubtotalAmount: number;
  todayISODate: string;
  userUsedCount?: number;
}): EligibilityResult {
  const coupon = params.coupon;
  if (!coupon || coupon.status !== 'active') {
    return { ok: false, code: 'COUPON_INVALID', message: 'คูปองไม่ถูกต้อง' };
  }

  if (coupon.valid_until && coupon.valid_until < params.todayISODate) {
    return { ok: false, code: 'COUPON_EXPIRED', message: 'คูปองหมดอายุ' };
  }

  if (params.cartSubtotalAmount < coupon.min_spend_amount) {
    return { ok: false, code: 'COUPON_MIN_SPEND_NOT_MET', message: 'ยอดสั่งซื้อไม่ถึงขั้นต่ำ' };
  }

  const limit = coupon.per_user_limit ?? null;
  if (limit !== null && (params.userUsedCount ?? 0) >= limit) {
    return { ok: false, code: 'COUPON_USAGE_LIMIT_REACHED', message: 'คุณใช้สิทธิ์ครบแล้ว' };
  }

  return { ok: true };
}

