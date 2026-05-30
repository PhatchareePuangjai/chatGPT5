import { Router } from 'express';
import { asyncHandler, requireStringField } from '../middleware/validate';
import { HttpError } from '../middleware/errorHandler';
import { findCouponByCode } from '../../models/couponRepo';
import { listActivePromotions } from '../../models/promotionRepo';
import { hasRedeemedCouponForUser, recordRedemption } from '../../models/couponRedemptionRepo';
import { validateCouponForCart } from '../../services/promotions/couponValidation';
import { computeTotals } from '../../services/promotions/engine';
import { promotionMessages } from '../../services/promotions/messages';
import { logPromotionOutcome } from '../../services/promotions/logger';

export const checkoutApplyCouponRouter = Router();

checkoutApplyCouponRouter.post(
  '/apply-coupon',
  asyncHandler(async (req, res) => {
    const cartId = requireStringField(req.body, 'cartId');
    const couponCode = requireStringField(req.body, 'couponCode');

    const coupon = findCouponByCode(couponCode);
    if (!coupon) throw new HttpError(400, 'INVALID_COUPON', 'คูปองไม่ถูกต้อง');

    const cart = {
      cartId,
      userId: 'demo-user',
      currency: 'THB' as const,
      subtotalSatang: 100000, // demo cart for now
    };

    const prior = hasRedeemedCouponForUser(coupon.id, cart.userId);
    const validation = validateCouponForCart({ cart, coupon, now: new Date(), hasPriorRedemption: prior });
    if (!validation.ok) {
      logPromotionOutcome({
        cartId: cart.cartId,
        userId: cart.userId,
        outcome: 'REJECTED',
        reasonCode: validation.error.code,
      });
      throw new HttpError(409, validation.error.code, validation.error.message);
    }

    if (coupon.usageLimitPerUser === 1) recordRedemption(coupon.id, cart.userId);

    const engine = computeTotals({ cart, promotions: listActivePromotions(), coupon });
    logPromotionOutcome({ cartId: cart.cartId, userId: cart.userId, outcome: 'APPLIED' });

    res.json({
      coupon: { code: coupon.code, status: 'APPLIED' },
      totals: engine.totals,
      discountLines: engine.discountLines,
      message: promotionMessages.couponApplied,
    });
  }),
);
