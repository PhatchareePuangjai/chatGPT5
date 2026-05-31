import type { Request, Response, NextFunction } from 'express';

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'COUPON_INVALID'
  | 'COUPON_EXPIRED'
  | 'COUPON_MIN_SPEND_NOT_MET'
  | 'COUPON_USAGE_LIMIT_REACHED'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(params: { status: number; code: ApiErrorCode; message: string }) {
    super(params.message);
    this.status = params.status;
    this.code = params.code;
  }
}

export function apiErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ status: 'rejected', code: err.code, message: err.message });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ status: 'rejected', code: 'INTERNAL_ERROR', message: 'Internal error' });
}
