const db = require("../db");

/**
 * POST /api/orders
 * Body: { userId: UUID, original_total_satang: integer }
 * Creates a new order with no discounts applied.
 */
async function createOrder(req, res, next) {
  try {
    const { userId, original_total_satang } = req.body || {};
    if (!userId || !Number.isInteger(original_total_satang) || original_total_satang < 0) {
      return res.status(400).json({ error: "INVALID_REQUEST", message: "userId and original_total_satang (>=0 integer) are required" });
    }

    const result = await db.query(
      `INSERT INTO orders (user_id, original_total_satang, grand_total_satang)
       VALUES ($1, $2, $2)
       RETURNING id, user_id, original_total_satang, grand_total_satang`,
      [userId, original_total_satang]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/orders/:id
 * For debugging/demo.
 */
async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, user_id, original_total_satang, discount_percent_satang, discount_fixed_satang, grand_total_satang, applied_coupon_id, created_at, updated_at
       FROM orders WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "ORDER_NOT_FOUND" });
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createOrder, getOrder };
