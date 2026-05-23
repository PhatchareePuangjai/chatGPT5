import express from "express";
import type pg from "pg";
import { z } from "zod";
import { confirmOrderBodySchema, cancelOrderBodySchema } from "../contracts/inventory.js";
import { cancelOrder, confirmOrder } from "../../services/inventoryService.js";

export function createOrdersRouter(pool: pg.Pool) {
  const router = express.Router();

  router.post("/:orderId/confirm", async (req, res, next) => {
    try {
      const orderId = z.coerce.number().int().positive().parse(req.params.orderId);
      confirmOrderBodySchema.parse(req.body ?? {});
      const result = await confirmOrder(pool, orderId);
      res.status(200).json({
        orderId: result.orderId,
        status: result.status,
        inventoryUpdates: result.inventoryUpdates.map((u) => ({
          skuCode: u.skuCode,
          deltaQty: u.deltaQty,
          newOnHandQty: u.newOnHandQty
        }))
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:orderId/cancel", async (req, res, next) => {
    try {
      const orderId = z.coerce.number().int().positive().parse(req.params.orderId);
      cancelOrderBodySchema.parse(req.body ?? {});
      const result = await cancelOrder(pool, orderId);
      res.status(200).json({
        orderId: result.orderId,
        status: result.status,
        inventoryUpdates: result.inventoryUpdates.map((u) => ({
          skuCode: u.skuCode,
          deltaQty: u.deltaQty,
          newOnHandQty: u.newOnHandQty
        }))
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
