const db = require('../db/pool');

function mapUsage(row) {
  if (!row) return null;
  return {
    ...row,
    times_used: Number(row.times_used),
  };
}

async function getUsage(userId, couponCode) {
  const result = await db.query('SELECT * FROM coupon_usages WHERE user_id = $1 AND coupon_code = $2', [userId, couponCode]);
  return mapUsage(result.rows[0]);
}

async function incrementUsage(userId, couponCode) {
  const result = await db.query(
    `INSERT INTO coupon_usages (user_id, coupon_code, times_used)
     VALUES ($1, $2, 1)
     ON CONFLICT (coupon_code, user_id)
     DO UPDATE SET times_used = coupon_usages.times_used + 1, updated_at = NOW()
     RETURNING *`,
    [userId, couponCode]
  );
  return mapUsage(result.rows[0]);
}

module.exports = { getUsage, incrementUsage };
