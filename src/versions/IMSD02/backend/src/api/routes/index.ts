import type { Router } from "express";
import express from "express";
import { createOrdersRouter } from "./orders.js";
import { createSkusRouter } from "./skus.js";
import { createAlertsRouter } from "./alerts.js";
import type pg from "pg";

export function createApiRouter(pool: pg.Pool): Router {
  const router = express.Router();
  router.use(express.json());

  router.use("/orders", createOrdersRouter(pool));
  router.use("/skus", createSkusRouter(pool));
  router.use("/alerts", createAlertsRouter(pool));

  return router;
}
