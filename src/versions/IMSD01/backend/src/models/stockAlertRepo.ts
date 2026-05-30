import type pg from "pg";

export async function insertLowStockAlert(
  client: pg.PoolClient,
  args: { productId: number; threshold: number; observedOnHand: number }
) {
  await client.query(
    "INSERT INTO stock_alerts(product_id, threshold, observed_on_hand) VALUES ($1, $2, $3)",
    [args.productId, args.threshold, args.observedOnHand]
  );
}

