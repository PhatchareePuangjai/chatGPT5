import { z } from "zod";

export const confirmOrderBodySchema = z.object({
  confirmedAt: z.string().datetime().optional()
});

export const cancelOrderBodySchema = z.object({
  canceledAt: z.string().datetime().optional(),
  reason: z.string().min(1).optional()
});

export const upsertSkuBodySchema = z.object({
  onHandQty: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative()
});

export type ConfirmOrderBody = z.infer<typeof confirmOrderBodySchema>;
export type CancelOrderBody = z.infer<typeof cancelOrderBodySchema>;
export type UpsertSkuBody = z.infer<typeof upsertSkuBodySchema>;
