import { Router } from "express";
import type pg from "pg";
import { buildInventoryRoutes } from "./inventory.js";
import { buildAlertRoutes } from "./alerts.js";

export function buildRoutes(pool: pg.Pool) {
  const r = Router();
  r.use("/inventory", buildInventoryRoutes(pool));
  r.use("/alerts", buildAlertRoutes(pool));
  return r;
}

