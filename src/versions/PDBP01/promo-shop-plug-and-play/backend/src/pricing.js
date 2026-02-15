const { COUPONS, isExpired } = require("./coupons");

/**
 * Pricing rules:
 * 1) Subtotal (sum price*qty)
 * 2) Automatic 10% discount first
 * 3) Coupon discount next (fixed amount)
 * 4) Total clamped to >= 0
 *
 * IMPORTANT: coupon min purchase is checked against subtotal BEFORE discounts.
 */
function computeTotals(subtotal_satang, coupon, autoDiscountPercent = 10) {
  const auto_discount_satang = Math.round(subtotal_satang * autoDiscountPercent / 100);
  const subtotal_after_auto_satang = Math.max(0, subtotal_satang - auto_discount_satang);

  let coupon_discount_satang = 0;
  if (coupon) {
    coupon_discount_satang = Math.min(coupon.amount_satang, subtotal_after_auto_satang);
  }

  const total_satang = Math.max(0, subtotal_after_auto_satang - coupon_discount_satang);

  return {
    subtotal_satang,
    auto_discount_satang,
    subtotal_after_auto_satang,
    coupon_discount_satang,
    total_satang
  };
}

function normalizeCode(code) {
  return String(code || "").trim().toUpperCase() || null;
}

function validateCoupon({ code, subtotal_satang, userUsedCount }) {
  if (!code) return { coupon: null, errors: [], messages: [] };

  const coupon = COUPONS[code];
  if (!coupon) return { coupon: null, errors: ["Invalid coupon code."], messages: [] };

  if (isExpired(coupon)) return { coupon: null, errors: ["Coupon expired."], messages: [] };

  if (subtotal_satang < (coupon.min_subtotal_satang || 0)) {
    const min = coupon.min_subtotal_satang || 0;
    return { coupon: null, errors: [`Minimum purchase not met. Need at least ${(min/100).toFixed(2)} baht.`], messages: [] };
  }

  if (coupon.per_user_limit && userUsedCount >= coupon.per_user_limit) {
    return { coupon: null, errors: ["You already used this."], messages: [] };
  }

  return { coupon, errors: [], messages: ["Success"] };
}

module.exports = { computeTotals, normalizeCode, validateCoupon };
