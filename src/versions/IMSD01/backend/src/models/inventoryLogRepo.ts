import type pg from "pg";

export async function insertInventoryLog(
  client: pg.PoolClient,
  args: { productId: number; type: string; delta: number; orderId?: string }
) {
  await client.query(
    "INSERT INTO inventory_logs(product_id, type, delta, order_id) VALUES ($1, $2, $3, $4)",
    [args.productId, args.type, args.delta, args.orderId ?? null]
  );
}

