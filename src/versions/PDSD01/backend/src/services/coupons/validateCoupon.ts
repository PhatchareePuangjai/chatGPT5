import { ApiError } from '../../api/errors.js';
import { money } from '../../lib/money.js';
import { findCouponByCode } from '../../models/coupons/couponRepo.js';
import { countRedemptionsForUser } from '../../models/coupons/redemptionRepo.js';
import { evaluateCouponEligibility } from './couponEligibility.js';

export type ValidatedCoupon = {
  code: string;
  kind: 'fixed' | 'percent';
  value: number;
  minSpend: number;
};

export async function validateCoupon(params: {
  code: string;
  cartSubtotalAmount: number; // satang
  userId: string | null;
  todayISODate: string;
}): Promise<ValidatedCoupon> {
  const coupon = await findCouponByCode(params.code);
  const usedCount =
    coupon?.per_user_limit && params.userId
      ? await countRedemptionsForUser({ userId: params.userId, couponCode: coupon.code })
      : 0;

  const eligibility = evaluateCouponEligibility({
    coupon,
    cartSubtotalAmount: params.cartSubtotalAmount,
    todayISODate: params.todayISODate,
    userUsedCount: usedCount,
  });

  if (!eligibility.ok) throw new ApiError({ status: 400, code: eligibility.code, message: eligibility.message });

  if (coupon.discount_type === 'fixed_amount') {
    // coupon.discount_value is satang
    money('THB', coupon.discount_value);
    return { code: coupon.code, kind: 'fixed', value: coupon.discount_value, minSpend: coupon.min_spend_amount };
  }

  return { code: coupon.code, kind: 'percent', value: coupon.discount_value, minSpend: coupon.min_spend_amount };
}
