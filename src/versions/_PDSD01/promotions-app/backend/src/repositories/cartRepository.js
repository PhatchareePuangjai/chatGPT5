const db = require('../db/pool');

function mapCart(row) {
  if (!row) return null;
  return {
    ...row,
    id: Number(row.id),
    subtotal_cents: Number(row.subtotal_cents),
  };
}

function mapDiscount(row) {
  return {
    ...row,
    amount_cents: Number(row.amount_cents),
    priority: Number(row.priority),
  };
}

async function getCartByUserId(userId) {
  const result = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  return mapCart(result.rows[0]);
}

async function getDiscounts(cartId) {
  const result = await db.query(
    'SELECT coupon_code, amount_cents, priority, discount_type, reason, created_at FROM cart_discounts WHERE cart_id = $1 ORDER BY priority ASC, created_at ASC',
    [cartId]
  );
  return result.rows.map(mapDiscount);
}

async function findDiscountByCode(cartId, couponCode) {
  const result = await db.query('SELECT * FROM cart_discounts WHERE cart_id = $1 AND coupon_code = $2', [cartId, couponCode]);
  const row = result.rows[0];
  return row ? mapDiscount(row) : null;
}

async function addDiscountLine(cartId, { couponCode, amountCents, priority, discountType, reason }) {
  const result = await db.query(
    `INSERT INTO cart_discounts (cart_id, coupon_code, amount_cents, priority, discount_type, reason)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (cart_id, coupon_code) DO UPDATE SET amount_cents = EXCLUDED.amount_cents, priority = EXCLUDED.priority, reason = EXCLUDED.reason
     RETURNING *`,
    [cartId, couponCode, amountCents, priority, discountType, reason]
  );
  return mapDiscount(result.rows[0]);
}

module.exports = {
  getCartByUserId,
  getDiscounts,
  findDiscountByCode,
  addDiscountLine,
};
