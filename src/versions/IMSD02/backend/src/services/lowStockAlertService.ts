import type pg from "pg";
import { hasAnyAlertForSku, insertLowStockAlert } from "../models/lowStockAlertRepo.js";

export async function maybeTriggerLowStockAlert(client: pg.PoolClient, opts: {
  skuId: number;
  onHandQty: number;
  threshold: number;
}) {
  if (opts.onHandQty > opts.threshold) return;

  // Minimal idempotency: if any alert exists for this SKU, do not insert another.
  const exists = await hasAnyAlertForSku(client, opts.skuId);
  if (exists) return;

  await insertLowStockAlert(client, {
    skuId: opts.skuId,
    onHandQtyAtTrigger: opts.onHandQty,
    thresholdAtTrigger: opts.threshold
  });
}
