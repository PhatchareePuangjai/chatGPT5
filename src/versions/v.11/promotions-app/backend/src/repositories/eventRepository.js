const db = require('../db/pool');

async function logEvent({ couponCode, userId, status, reason, deltaCents }) {
  await db.query(
    `INSERT INTO promotion_events (coupon_code, user_id, status, reason, delta_cents)
     VALUES ($1, $2, $3, $4, $5)`,
    [couponCode, userId, status, reason, deltaCents]
  );
}

module.exports = { logEvent };
