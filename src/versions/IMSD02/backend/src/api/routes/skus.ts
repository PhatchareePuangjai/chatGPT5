import express from "express";
import type pg from "pg";
import { z } from "zod";
import { upsertSkuBodySchema } from "../contracts/inventory.js";
import { withTx } from "../../db/tx.js";
import { getSkuByCode, upsertSku } from "../../models/skuRepo.js";

export function createSkusRouter(pool: pg.Pool) {
  const router = express.Router();

  router.put("/:skuCode", async (req, res, next) => {
    try {
      const skuCode = z.string().min(1).parse(req.params.skuCode);
      const body = upsertSkuBodySchema.parse(req.body ?? {});
      const sku = await withTx(pool, async (client) => upsertSku(client, skuCode, body.onHandQty, body.lowStockThreshold));
      res.status(200).json({ skuCode: sku.code, onHandQty: sku.on_hand_qty, lowStockThreshold: sku.low_stock_threshold });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:skuCode", async (req, res, next) => {
    try {
      const skuCode = z.string().min(1).parse(req.params.skuCode);
      const sku = await withTx(pool, async (client) => getSkuByCode(client, skuCode));
      if (!sku) {
        res.status(404).json({ code: "SKU_NOT_FOUND", message: "SKU not found" });
        return;
      }
      res.status(200).json({ skuCode: sku.code, onHandQty: sku.on_hand_qty, lowStockThreshold: sku.low_stock_threshold });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
