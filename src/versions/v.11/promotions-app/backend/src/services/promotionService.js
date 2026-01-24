const couponRepository = require('../repositories/couponRepository');
const cartRepository = require('../repositories/cartRepository');
const usageRepository = require('../repositories/couponUsageRepository');
const eventRepository = require('../repositories/eventRepository');
const { percentOf, clampZero, sumCents } = require('../utils/money');
const { errorFactory } = require('../utils/errors');

function validateDateWindow(coupon) {
  const now = new Date();
  if (now < coupon.start_at || now > coupon.end_at) {
    throw errorFactory.expired();
  }
}

function validateMinimum(cart, coupon) {
  if (cart.subtotal_cents < coupon.min_subtotal_cents) {
    throw errorFactory.minSpend();
  }
}

async function validateUsage(userId, coupon) {
  const usage = await usageRepository.getUsage(userId, coupon.code);
  if (usage && usage.times_used >= coupon.usage_limit_per_user) {
    throw errorFactory.usageLimit();
  }
}

function determinePriority(coupon) {
  if (coupon.priority_override) {
    return coupon.priority_override;
  }
  return coupon.type === 'percent' ? 1 : 2;
}

function computeDiscountAmount(cart, coupon) {
  if (coupon.type === 'percent') {
    return percentOf(cart.subtotal_cents, coupon.value_percent);
  }
  return coupon.value_cents;
}

async function applyCoupon({ userId, couponCode }) {
  const normalizedCode = couponCode.trim().toUpperCase();
  try {
    const cart = await cartRepository.getCartByUserId(userId);
    if (!cart) {
      const err = new Error('Cart not found');
      err.status = 404;
      err.reason = 'cart_not_found';
      throw err;
    }

    const coupon = await couponRepository.findByCode(normalizedCode);
    if (!coupon) {
      throw errorFactory.notFound();
    }

    const existingDiscount = await cartRepository.findDiscountByCode(cart.id, normalizedCode);
    if (existingDiscount) {
      throw errorFactory.duplicate();
    }

    validateDateWindow(coupon);
    validateMinimum(cart, coupon);
    await validateUsage(userId, coupon);

    const discountAmount = computeDiscountAmount(cart, coupon);
    const priority = determinePriority(coupon);

    await cartRepository.addDiscountLine(cart.id, {
      couponCode: normalizedCode,
      amountCents: discountAmount,
      priority,
      discountType: coupon.type,
      reason: 'applied',
    });

    await usageRepository.incrementUsage(userId, normalizedCode);

    const discounts = await cartRepository.getDiscounts(cart.id);
    const totalDiscount = clampZero(sumCents(discounts.map((d) => d.amount_cents)));
    const grand = clampZero(cart.subtotal_cents - totalDiscount);

    await eventRepository.logEvent({
      couponCode: normalizedCode,
      userId,
      status: 'applied',
      reason: 'success',
      deltaCents: discountAmount,
    });

    return {
      discountAmount,
      message: 'ใช้คูปองสำเร็จ',
      grandTotalCents: grand,
    };
  } catch (error) {
    await eventRepository.logEvent({
      couponCode: normalizedCode,
      userId,
      status: 'rejected',
      reason: error.reason || 'error',
      deltaCents: 0,
    });
    throw error;
  }
}

module.exports = {
  applyCoupon,
  __testables: {
    computeDiscountAmount,
    determinePriority,
  },
};
