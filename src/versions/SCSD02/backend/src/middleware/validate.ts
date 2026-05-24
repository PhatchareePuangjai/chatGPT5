import { z, type ZodSchema } from 'zod';
import { ApiError } from '../api/errors.js';

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: any, _res: any, next: any) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError({
          code: 'VALIDATION_ERROR',
          status: 400,
          message: parsed.error.issues.map((i) => i.message).join('; '),
        }),
      );
    }
    req.body = parsed.data;
    next();
  };
}

export const schemas = {
  addItem: z.object({
    sku: z.string().min(1),
    qty: z.number().int().positive(),
  }),
  setQty: z.object({
    qty: z.number().int().positive(),
  }),
};

