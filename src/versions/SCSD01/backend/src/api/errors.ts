export type ErrorCode = 'INSUFFICIENT_STOCK' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly userMessage: string;
  public readonly details?: Record<string, unknown>;

  constructor(args: {
    code: ErrorCode;
    httpStatus: number;
    message: string;
    userMessage: string;
    details?: Record<string, unknown>;
  }) {
    super(args.message);
    this.code = args.code;
    this.httpStatus = args.httpStatus;
    this.userMessage = args.userMessage;
    this.details = args.details;
  }
}

export function insufficientStock(details?: Record<string, unknown>): AppError {
  return new AppError({
    code: 'INSUFFICIENT_STOCK',
    httpStatus: 409,
    message: 'Insufficient stock',
    userMessage: 'สินค้าไม่เพียงพอ',
    details
  });
}

export function notFound(message = 'Not found', details?: Record<string, unknown>): AppError {
  return new AppError({ code: 'NOT_FOUND', httpStatus: 404, message, userMessage: message, details });
}

