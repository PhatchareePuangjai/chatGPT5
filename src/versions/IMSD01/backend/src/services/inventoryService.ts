import type pg from "pg";
import { withClient, withTx } from "../db/query.js";
import { getProductForUpdate, updateOnHand } from "../models/productRepo.js";
import { insertInventoryLog } from "../models/inventoryLogRepo.js";
import { insertLowStockAlert } from "../models/stockAlertRepo.js";
import { HttpError } from "../api/middleware/errorHandler.js";

export type DeductInput = { orderId: string; sku: string; quantity: number };
export type RestoreInput = { orderId: string; sku: string; quantity: number; reason: "CANCELED" | "EXPIRED" };

export function inventoryService(pool: pg.Pool) {
  return {
    async deduct(input: DeductInput) {
      return await withClient(pool, async (client) => {
        return await withTx(client, async () => {
          const product = await getProductForUpdate(client, input.sku);
          if (!product) throw new HttpError(404, "SKU_NOT_FOUND", "SKU not found.", { sku: input.sku });

          const previousOnHand = product.onHand;
          if (input.quantity > previousOnHand) {
            throw new HttpError(409, "INSUFFICIENT_STOCK", "Insufficient stock.", {
              sku: input.sku,
              requested: input.quantity,
              available: previousOnHand
            });
          }

          const onHand = previousOnHand - input.quantity;
          await updateOnHand(client, product.id, onHand);

          // Test-only failpoint to validate transaction atomicity.
          if (process.env.IMSD01_FAIL_LOG_INSERT === "1") {
            throw new Error("Failpoint: inventory log insert failure");
          }

          await insertInventoryLog(client, {
            productId: product.id,
            type: "SALE",
            delta: -input.quantity,
            orderId: input.orderId
          });

          let lowStockAlertCreated = false;
          if (onHand <= product.lowStockThreshold) {
            await insertLowStockAlert(client, {
              productId: product.id,
              threshold: product.lowStockThreshold,
              observedOnHand: onHand
            });
            lowStockAlertCreated = true;
          }

          return {
            sku: input.sku,
            previousOnHand,
            onHand,
            inventoryLog: { type: "SALE", delta: -input.quantity },
            lowStockAlertCreated
          };
        });
      });
    },

    async restore(input: RestoreInput) {
      return await withClient(pool, async (client) => {
        return await withTx(client, async () => {
          const product = await getProductForUpdate(client, input.sku);
          if (!product) throw new HttpError(404, "SKU_NOT_FOUND", "SKU not found.", { sku: input.sku });

          const previousOnHand = product.onHand;
          const onHand = previousOnHand + input.quantity;

          await updateOnHand(client, product.id, onHand);
          await insertInventoryLog(client, {
            productId: product.id,
            type: "RESTOCK/RETURN",
            delta: input.quantity,
            orderId: input.orderId
          });

          return {
            sku: input.sku,
            previousOnHand,
            onHand,
            inventoryLog: { type: "RESTOCK/RETURN", delta: input.quantity }
          };
        });
      });
    }
  };
}
