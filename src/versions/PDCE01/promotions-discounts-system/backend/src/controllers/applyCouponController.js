const db = require("../db");
const { calcPercentDiscount } = require("../utils/money");

/**
 * POST /api/apply-coupon
 * Body: { userId: UUID, orderId: UUID, couponCode: string }
 *
 * Order of operations (critical):
 *   (Original Total - Percentage Discount) - Fixed Amount Discount
 *
 * Precision:
 *   All values are integer satang.
 */
async function applyCoupon(req, res, next) {
  try {
    const { userId, orderId, couponCode } = req.body || {};

    if (!userId || !orderId || !couponCode || typeof couponCode !== "string") {
      return res.status(400).json({ error: "INVALID_REQUEST", message: "userId, orderId, couponCode are required" });
    }

    // 1) Load order (and ensure it belongs to user)
    const orderResult = await db.query(
      `SELECT id, user_id, original_total_satang, applied_coupon_id
       FROM orders
       WHERE id = $1`,
      [orderId]
    );
    if (orderResult.rowCount === 0) {
      return res.status(404).json({ error: "ORDER_NOT_FOUND", message: "Order not found" });
    }
    const order = orderResult.rows[0];
    if (order.user_id !== userId) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Order does not belong to user" });
    }

    const original = parseInt(order.original_total_satang, 10);

    // 2) Load coupon
    const couponResult = await db.query(
      `SELECT id, code, min_purchase_satang, expires_at, one_time_per_user, percent_bps, fixed_discount_satang, is_active
       FROM coupons
       WHERE code = $1`,
      [couponCode.trim().toUpperCase()]
    );

    if (couponResult.rowCount === 0) {
      return res.status(400).json({ error: "COUPON_INVALID", message: "Invalid coupon code" });
    }

    const coupon = couponResult.rows[0];

    if (!coupon.is_active) {
      return res.status(400).json({ error: "COUPON_INACTIVE", message: "Coupon is inactive" });
    }

    // 3) Expiry check (Current date vs expiry date)
    if (coupon.expires_at) {
      const now = new Date();
      const expires = new Date(coupon.expires_at);
      if (now.getTime() > expires.getTime()) {
        return res.status(400).json({ error: "COUPON_EXPIRED", message: "Coupon has expired" });
      }
    }

    // 4) Minimum purchase check (based on original total, before discounts)
    const minPurchase = parseInt(coupon.min_purchase_satang, 10);
    if (original < minPurchase) {
      return res.status(400).json({
        error: "MIN_PURCHASE_NOT_MET",
        message: `Minimum purchase not met`,
        min_purchase_satang: minPurchase,
      });
    }

    // 5) One-time per user policy (query history before approval)
    if (coupon.one_time_per_user) {
      const used = await db.query(
        `SELECT 1 FROM user_coupon_history WHERE user_id = $1 AND coupon_id = $2 LIMIT 1`,
        [userId, coupon.id]
      );
      if (used.rowCount > 0) {
        return res.status(400).json({ error: "COUPON_OVERUSED", message: "Coupon already used by this user" });
      }
    }

    // 6) Sequenced calculation (integer satang)
    const percentBps = parseInt(coupon.percent_bps, 10);
    const fixedSatang = parseInt(coupon.fixed_discount_satang, 10);

    const percentDiscount = calcPercentDiscount(original, percentBps);
    const afterPercent = original - percentDiscount;
    const afterFixed = afterPercent - fixedSatang;

    // Negative protection (grand total must never be negative)
    const grandTotal = Math.max(0, afterFixed);

    // Adjust actual fixed discount applied if coupon exceeds remaining total
    // This ensures audit fields reflect reality (e.g., 100 THB off a 50 THB order => fixed applied = 50 THB).
    const fixedApplied = Math.max(0, Math.min(fixedSatang, afterPercent));

    // 7) Persist: update order + insert history (transaction)
    await db.query("BEGIN");

    const updated = await db.query(
      `UPDATE orders
       SET discount_percent_satang = $1,
           discount_fixed_satang = $2,
           grand_total_satang = $3,
           applied_coupon_id = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, original_total_satang, discount_percent_satang, discount_fixed_satang, grand_total_satang, applied_coupon_id`,
      [percentDiscount, fixedApplied, grandTotal, coupon.id, orderId]
    );

    if (coupon.one_time_per_user) {
      await db.query(
        `INSERT INTO user_coupon_history (user_id, coupon_id, order_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, coupon_id) DO NOTHING`,
        [userId, coupon.id, orderId]
      );
    }

    await db.query("COMMIT");

    const row = updated.rows[0];

    return res.json({
      orderId: row.id,
      original_total_satang: parseInt(row.original_total_satang, 10),
      discount_percent_satang: parseInt(row.discount_percent_satang, 10),
      discount_fixed_satang: parseInt(row.discount_fixed_satang, 10),
      grand_total_satang: parseInt(row.grand_total_satang, 10),
      applied_coupon: { code: coupon.code, percent_bps: percentBps, fixed_discount_satang: fixedSatang, one_time_per_user: !!coupon.one_time_per_user },
    });
  } catch (err) {
    try {
      await db.query("ROLLBACK");
    } catch (_) {}
    return next(err);
  }
}

module.exports = { applyCoupon };
