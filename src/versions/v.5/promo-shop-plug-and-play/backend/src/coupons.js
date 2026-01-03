/**
 * Money is stored as integer "satang" (1 baht = 100 satang)
 * Example: 100 baht = 10000 satang
 */
const COUPONS = {
  SAVE100: {
    code: "SAVE100",
    type: "fixed",
    amount_satang: 10000,        // 100 baht off
    min_subtotal_satang: 50000,  // >= 500 baht required (based on subtotal BEFORE discounts)
    expires_at: "2026-12-31T23:59:59Z",
    per_user_limit: null
  },
  WELCOME: {
    code: "WELCOME",
    type: "fixed",
    amount_satang: 10000,
    min_subtotal_satang: 0,
    expires_at: "2026-12-31T23:59:59Z",
    per_user_limit: 1
  },
  EXPIRED10: {
    code: "EXPIRED10",
    type: "fixed",
    amount_satang: 1000,
    min_subtotal_satang: 0,
    expires_at: "2020-01-01T00:00:00Z",
    per_user_limit: null
  },
  EXPIRED: {
    code: "EXPIRED",
    type: "fixed",
    amount_satang: 10000,
    min_subtotal_satang: 0,
    expires_at: "2025-01-01T00:00:00Z", // Expired yesterday (relative to 2026)
    per_user_limit: null
  }
};

function isExpired(coupon, now = new Date()) {
  const exp = new Date(coupon.expires_at);
  return Number.isNaN(exp.getTime()) ? false : now > exp;
}

module.exports = { COUPONS, isExpired };
