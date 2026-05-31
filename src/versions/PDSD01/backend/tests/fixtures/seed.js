import { pool } from '../../src/db/index.js';
export async function seedCoupons() {
    await pool.query(`insert into coupons (code, status, valid_until, min_spend_amount, discount_type, discount_value, per_user_limit)
     values
      ('SAVE100','active', null, 50000, 'fixed_amount', 10000, null),
      ('EXPIRED','active', '2000-01-01', 0, 'fixed_amount', 10000, null),
      ('WELCOME','active', null, 0, 'fixed_amount', 10000, 1)
     on conflict (code) do nothing`);
}
export async function seedPromotions() {
    await pool.query(`insert into promotions (id, status, promotion_type, value)
     values ('promo10','active','cart_total_percent',10)
     on conflict (id) do nothing`);
}
