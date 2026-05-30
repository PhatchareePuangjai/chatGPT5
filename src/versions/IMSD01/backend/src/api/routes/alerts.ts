import { Router } from "express";
import type pg from "pg";
import { respondOk } from "../http/respond.js";

export function buildAlertRoutes(pool: pg.Pool) {
  const r = Router();

  r.get("/low-stock", async (_req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT p.sku, a.threshold, a.observed_on_hand as "observedOnHand", a.created_at as "createdAt"
         FROM stock_alerts a
         JOIN products p ON p.id = a.product_id
         ORDER BY a.created_at DESC
         LIMIT 50`
      );
      respondOk(res, { alerts: result.rows });
    } catch (e) {
      next(e);
    }
  });

  return r;
}

