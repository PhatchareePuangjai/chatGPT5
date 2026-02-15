const db = require('../db/pool');

function mapCoupon(row) {
  if (!row) return null;
  return {
    ...row,
    value_cents: Number(row.value_cents),
    value_percent: Number(row.value_percent),
    min_subtotal_cents: Number(row.min_subtotal_cents),
    usage_limit_per_user: Number(row.usage_limit_per_user),
    priority_override: row.priority_override ? Number(row.priority_override) : null,
    start_at: new Date(row.start_at),
    end_at: new Date(row.end_at),
  };
}

async function findByCode(code) {
  const result = await db.query('SELECT * FROM coupons WHERE code = $1', [code]);
  return mapCoupon(result.rows[0]);
}

module.exports = { findByCode };
