import { promotionMessages } from './messages';
import type { CartSnapshot, Coupon } from './types';

export type CouponValidationError =
  | { code: 'COUPON_EXPIRED'; message: string }
  | { code: 'COUPON_MIN_SPEND_NOT_MET'; message: string }
  | { code: 'COUPON_USAGE_LIMIT_REACHED'; message: string };

export function validateCouponForCart(args: {
  cart: CartSnapshot;
  coupon: Coupon;
  now: Date;
  hasPriorRedemption: boolean;
}): { ok: true } | { ok: false; error: CouponValidationError } {
  const { cart, coupon, now, hasPriorRedemption } = args;

  if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) {
    return { ok: false, error: { code: 'COUPON_EXPIRED', message: promotionMessages.couponExpired } };
  }

  if (cart.subtotalSatang < coupon.minSpendSatang) {
    return {
      ok: false,
      error: { code: 'COUPON_MIN_SPEND_NOT_MET', message: 'ยอดซื้อไม่ถึงขั้นต่ำ' },
    };
  }

  if (coupon.usageLimitPerUser === 1 && hasPriorRedemption) {
    return {
      ok: false,
      error: {
        code: 'COUPON_USAGE_LIMIT_REACHED',
        message: promotionMessages.couponUsageLimitReached,
      },
    };
  }

  return { ok: true };
}
