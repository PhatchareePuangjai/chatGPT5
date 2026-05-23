import type pg from "pg";

export type LowStockAlertRow = {
  id: number;
  sku_id: number;
  on_hand_qty_at_trigger: number;
  threshold_at_trigger: number;
  created_at: string;
};

export async function hasAnyAlertForSku(client: pg.PoolClient, skuId: number): Promise<boolean> {
  const res = await client.query("SELECT 1 FROM low_stock_alerts WHERE sku_id = $1 LIMIT 1", [skuId]);
  return !!res.rowCount;
}

export async function insertLowStockAlert(client: pg.PoolClient, opts: {
  skuId: number;
  onHandQtyAtTrigger: number;
  thresholdAtTrigger: number;
}) {
  await client.query(
    `INSERT INTO low_stock_alerts (sku_id, on_hand_qty_at_trigger, threshold_at_trigger)
     VALUES ($1,$2,$3)`,
    [opts.skuId, opts.onHandQtyAtTrigger, opts.thresholdAtTrigger]
  );
}

export async function listAlerts(client: pg.PoolClient): Promise<LowStockAlertRow[]> {
  const res = await client.query(
    "SELECT id, sku_id, on_hand_qty_at_trigger, threshold_at_trigger, created_at FROM low_stock_alerts ORDER BY id DESC"
  );
  return res.rows as LowStockAlertRow[];
}
