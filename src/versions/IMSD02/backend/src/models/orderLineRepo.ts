import type pg from "pg";

export type OrderLineRow = {
  sku_id: number;
  qty: number;
};

export async function listOrderLinesByOrderId(client: pg.PoolClient, orderId: number): Promise<OrderLineRow[]> {
  const res = await client.query("SELECT sku_id, qty FROM order_lines WHERE order_id = $1 ORDER BY id ASC", [
    orderId
  ]);
  return res.rows as OrderLineRow[];
}
