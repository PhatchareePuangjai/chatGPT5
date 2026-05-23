import type pg from "pg";
import { withTx } from "../db/tx.js";
import { ApiError } from "../api/middleware/errorHandler.js";
import { getOrderById, updateOrderStatus } from "../models/orderRepo.js";
import { listOrderLinesByOrderId } from "../models/orderLineRepo.js";
import { claimStockForSale, getSkuForUpdateById, updateSkuOnHand } from "../models/skuRepo.js";
import { insertInventoryLog } from "../models/inventoryLogRepo.js";
import { maybeTriggerLowStockAlert } from "./lowStockAlertService.js";

export async function confirmOrder(pool: pg.Pool, orderId: number) {
  const result = await withTx(pool, async (client) => {
    const order = await getOrderById(client, orderId);
    if (order.status !== "pending") {
      throw new ApiError({ status: 409, code: "ORDER_NOT_PENDING", message: "Order is not pending" });
    }

    const lines = await listOrderLinesByOrderId(client, orderId);
    if (lines.length === 0) {
      throw new ApiError({ status: 409, code: "ORDER_EMPTY", message: "Order has no lines" });
    }

    const updates: { skuId: number; skuCode: string; deltaQty: number; newOnHandQty: number }[] = [];

    for (const line of lines) {
      const updatedSku = await claimStockForSale(client, { skuId: line.sku_id, qty: line.qty });
      const newOnHandQty = updatedSku.on_hand_qty;
      await insertInventoryLog(client, {
        skuId: updatedSku.id,
        deltaQty: -line.qty,
        reason: "sale",
        referenceType: "order",
        referenceId: String(orderId)
      });
      if (process.env.FORCE_INVENTORY_LOG_FAIL === "1") {
        throw new Error("Forced inventory log failure");
      }
      await maybeTriggerLowStockAlert(client, {
        skuId: updatedSku.id,
        onHandQty: newOnHandQty,
        threshold: updatedSku.low_stock_threshold
      });
      updates.push({ skuId: updatedSku.id, skuCode: updatedSku.code, deltaQty: -line.qty, newOnHandQty });
    }

    await updateOrderStatus(client, orderId, "confirmed");
    return { orderId: String(orderId), status: "confirmed", inventoryUpdates: updates };
  });
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: "inventory_order_confirmed",
      orderId: result.orderId,
      updates: result.inventoryUpdates.map((u) => ({ skuCode: u.skuCode, deltaQty: u.deltaQty }))
    })
  );
  return result;
}

export async function cancelOrder(pool: pg.Pool, orderId: number) {
  const result = await withTx(pool, async (client) => {
    const order = await getOrderById(client, orderId);
    if (order.status !== "pending") {
      throw new ApiError({ status: 409, code: "ORDER_NOT_PENDING", message: "Order is not pending" });
    }

    const lines = await listOrderLinesByOrderId(client, orderId);
    if (lines.length === 0) {
      throw new ApiError({ status: 409, code: "ORDER_EMPTY", message: "Order has no lines" });
    }

    const updates: { skuId: number; skuCode: string; deltaQty: number; newOnHandQty: number }[] = [];

    for (const line of lines) {
      const sku = await getSkuForUpdateById(client, line.sku_id);
      const newOnHandQty = sku.on_hand_qty + line.qty;
      await updateSkuOnHand(client, sku.id, newOnHandQty);
      await insertInventoryLog(client, {
        skuId: sku.id,
        deltaQty: line.qty,
        reason: "restock_return",
        referenceType: "order",
        referenceId: String(orderId)
      });
      await maybeTriggerLowStockAlert(client, {
        skuId: sku.id,
        onHandQty: newOnHandQty,
        threshold: sku.low_stock_threshold
      });
      updates.push({ skuId: sku.id, skuCode: sku.code, deltaQty: line.qty, newOnHandQty });
    }

    await updateOrderStatus(client, orderId, "canceled");
    return { orderId: String(orderId), status: "canceled", inventoryUpdates: updates };
  });
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: "inventory_order_canceled",
      orderId: result.orderId,
      updates: result.inventoryUpdates.map((u) => ({ skuCode: u.skuCode, deltaQty: u.deltaQty }))
    })
  );
  return result;
}
