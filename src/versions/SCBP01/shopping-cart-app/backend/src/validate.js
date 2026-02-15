import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().positive().max(999).default(1),
});

export const updateQtySchema = z.object({
  qty: z.number().int().nonnegative().max(999),
});

export const saveSchema = z.object({
  saved: z.boolean(),
});

export function parseJson(req) {
  // Express.json() already parsed. This helper just ensures object.
  return req.body && typeof req.body === "object" ? req.body : {};
}
