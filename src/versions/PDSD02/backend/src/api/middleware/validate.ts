import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler';

export function requireStringField(body: any, field: string): string {
  const value = body?.[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', `Missing or invalid field: ${field}`);
  }
  return value;
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

