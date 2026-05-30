import type pg from "pg";

export async function getProductForUpdate(client: pg.PoolClient, sku: string) {
  const r = await client.query(
    "SELECT id, sku, on_hand as \"onHand\", low_stock_threshold as \"lowStockThreshold\" FROM products WHERE sku = $1 FOR UPDATE",
    [sku]
  );
  return r.rows[0] as
    | { id: number; sku: string; onHand: number; lowStockThreshold: number }
    | undefined;
}

export async function updateOnHand(client: pg.PoolClient, productId: number, newOnHand: number) {
  await client.query("UPDATE products SET on_hand = $1, updated_at = now() WHERE id = $2", [
    newOnHand,
    productId
  ]);
}

