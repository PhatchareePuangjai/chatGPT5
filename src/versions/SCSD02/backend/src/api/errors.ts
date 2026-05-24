export type ApiErrorCode =
  | 'INSUFFICIENT_STOCK'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;

  constructor(params: { code: ApiErrorCode; status: number; message: string }) {
    super(params.message);
    this.code = params.code;
    this.status = params.status;
  }
}

export function mapErrorToApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (err as any).code;
    if (code === 'INSUFFICIENT_STOCK') {
      return new ApiError({ code: 'INSUFFICIENT_STOCK', status: 409, message: 'Insufficient stock' });
    }
    if (code === 'NOT_FOUND') {
      return new ApiError({ code: 'NOT_FOUND', status: 404, message: 'Not found' });
    }
    if (code === 'VALIDATION_ERROR') {
      return new ApiError({ code: 'VALIDATION_ERROR', status: 400, message: err.message });
    }
  }
  return new ApiError({ code: 'INTERNAL_ERROR', status: 500, message: 'Internal error' });
}

