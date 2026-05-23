import type pg from "pg";
import { ApiError } from "../api/middleware/errorHandler.js";

export type SkuRow = {
  id: number;
  code: string;
  on_hand_qty: number;
  low_stock_threshold: number;
};

export async function getSkuById(client: pg.PoolClient, id: number): Promise<SkuRow | null> {
  const res = await client.query(
    "SELECT id, code, on_hand_qty, low_stock_threshold FROM skus WHERE id = $1",
    [id]
  );
  return res.rowCount ? (res.rows[0] as SkuRow) : null;
}

export async function getSkuByCode(client: pg.PoolClient, code: string): Promise<SkuRow | null> {
  const res = await client.query(
    "SELECT id, code, on_hand_qty, low_stock_threshold FROM skus WHERE code = $1",
    [code]
  );
  return res.rowCount ? (res.rows[0] as SkuRow) : null;
}

export async function getSkuForUpdateById(client: pg.PoolClient, id: number): Promise<SkuRow> {
  const res = await client.query(
    "SELECT id, code, on_hand_qty, low_stock_threshold FROM skus WHERE id = $1 FOR UPDATE",
    [id]
  );
  if (!res.rowCount) {
    throw new ApiError({ status: 404, code: "SKU_NOT_FOUND", message: "SKU not found" });
  }
  return res.rows[0] as SkuRow;
}

export async function claimStockForSale(client: pg.PoolClient, opts: { skuId: number; qty: number }): Promise<SkuRow> {
  const res = await client.query(
    `UPDATE skus
     SET on_hand_qty = on_hand_qty - $2,
         updated_at = NOW()
     WHERE id = $1 AND on_hand_qty >= $2
     RETURNING id, code, on_hand_qty, low_stock_threshold`,
    [opts.skuId, opts.qty]
  );
  if (!res.rowCount) {
    const sku = await getSkuById(client, opts.skuId);
    if (!sku) {
      throw new ApiError({ status: 404, code: "SKU_NOT_FOUND", message: "SKU not found" });
    }
    throw new ApiError({
      status: 409,
      code: "INSUFFICIENT_STOCK",
      message: "Insufficient stock",
      details: { skuCode: sku.code, onHandQty: sku.on_hand_qty, requestedQty: opts.qty }
    });
  }
  return res.rows[0] as SkuRow;
}

export async function upsertSku(
  client: pg.PoolClient,
  code: string,
  onHandQty: number,
  lowStockThreshold: number
): Promise<SkuRow> {
  const res = await client.query(
    `INSERT INTO skus (code, on_hand_qty, low_stock_threshold)
     VALUES ($1,$2,$3)
     ON CONFLICT (code) DO UPDATE
       SET on_hand_qty = EXCLUDED.on_hand_qty,
           low_stock_threshold = EXCLUDED.low_stock_threshold,
           updated_at = NOW()
     RETURNING id, code, on_hand_qty, low_stock_threshold`,
    [code, onHandQty, lowStockThreshold]
  );
  return res.rows[0] as SkuRow;
}

export async function updateSkuOnHand(client: pg.PoolClient, id: number, newOnHandQty: number): Promise<void> {
  await client.query("UPDATE skus SET on_hand_qty = $2, updated_at = NOW() WHERE id = $1", [
    id,
    newOnHandQty
  ]);
}
