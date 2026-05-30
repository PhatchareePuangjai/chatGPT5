import { Router } from "express";
import type pg from "pg";
import { HttpError } from "../middleware/errorHandler.js";
import { respondOk } from "../http/respond.js";
import { requireEnum, requirePositiveInt, requireString } from "../validation/validators.js";
import { inventoryService } from "../../services/inventoryService.js";

export function buildInventoryRoutes(pool: pg.Pool) {
  const r = Router();

  r.post("/deduct", async (req, res, next) => {
    try {
      const orderId = requireString(req.body?.orderId, "orderId");
      const sku = requireString(req.body?.sku, "sku");
      const quantity = requirePositiveInt(req.body?.quantity, "quantity");

      const out = await inventoryService(pool).deduct({ orderId, sku, quantity });
      respondOk(res, out);
    } catch (e: any) {
      next(e instanceof HttpError ? e : new HttpError(400, "BAD_REQUEST", "Invalid request."));
    }
  });

  r.post("/restore", async (req, res, next) => {
    try {
      const orderId = requireString(req.body?.orderId, "orderId");
      const sku = requireString(req.body?.sku, "sku");
      const quantity = requirePositiveInt(req.body?.quantity, "quantity");
      const reason = requireEnum(req.body?.reason, "reason", ["CANCELED", "EXPIRED"] as const);

      const out = await inventoryService(pool).restore({ orderId, sku, quantity, reason });
      respondOk(res, out);
    } catch (e: any) {
      next(e instanceof HttpError ? e : new HttpError(400, "BAD_REQUEST", "Invalid request."));
    }
  });

  return r;
}
