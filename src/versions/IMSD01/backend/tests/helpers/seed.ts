import type pg from "pg";

export async function truncateAll(pool: pg.Pool) {
  await pool.query("TRUNCATE TABLE stock_alerts RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE inventory_logs RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE");
}

export async function ensureProduct(
  pool: pg.Pool,
  args: { sku: string; onHand: number; threshold?: number }
) {
  const threshold = args.threshold ?? 5;
  await pool.query(
    `INSERT INTO products(sku, on_hand, low_stock_threshold)
     VALUES ($1, $2, $3)
     ON CONFLICT (sku) DO UPDATE SET on_hand = excluded.on_hand, low_stock_threshold = excluded.low_stock_threshold`,
    [args.sku, args.onHand, threshold]
  );
}

