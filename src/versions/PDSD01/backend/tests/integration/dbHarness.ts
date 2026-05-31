import { pool } from '../../src/db/index.js';

export async function resetDb(): Promise<void> {
  // Minimal reset for tests: truncate known tables if they exist.
  await pool.query('truncate table coupon_redemptions restart identity cascade').catch(() => {});
  await pool.query('truncate table coupons restart identity cascade').catch(() => {});
  await pool.query('truncate table promotions restart identity cascade').catch(() => {});
}
