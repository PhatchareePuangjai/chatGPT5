import type pg from "pg";

export async function insertInventoryLog(client: pg.PoolClient, opts: {
  skuId: number;
  deltaQty: number;
  reason: string;
  referenceType: string;
  referenceId: string;
}) {
  await client.query(
    `INSERT INTO inventory_logs (sku_id, delta_qty, reason, reference_type, reference_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [opts.skuId, opts.deltaQty, opts.reason, opts.referenceType, opts.referenceId]
  );
}
