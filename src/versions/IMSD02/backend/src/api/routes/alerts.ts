import express from "express";
import type pg from "pg";
import { withTx } from "../../db/tx.js";
import { listAlerts } from "../../models/lowStockAlertRepo.js";

export function createAlertsRouter(pool: pg.Pool) {
  const router = express.Router();

  router.get("/", async (_req, res, next) => {
    try {
      const alerts = await withTx(pool, async (client) => listAlerts(client));
      res.status(200).json({
        alerts: alerts.map((a) => ({
          skuId: a.sku_id,
          onHandQtyAtTrigger: a.on_hand_qty_at_trigger,
          thresholdAtTrigger: a.threshold_at_trigger,
          createdAt: a.created_at
        }))
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
