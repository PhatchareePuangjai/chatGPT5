import type { ErrorRequestHandler } from "express";
import { respondError } from "../http/respond.js";

export class HttpError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errorHandlerMiddleware = (): ErrorRequestHandler => {
  return (err, _req, res, _next) => {
    const requestId = res.locals.requestId;
    if (err instanceof HttpError) {
      respondError(res, err.status, err.code, err.message, err.details);
      return;
    }

    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        level: "error",
        msg: "unhandled_error",
        requestId,
        error: { name: err?.name, message: err?.message }
      })
    );

    respondError(res, 500, "INTERNAL_ERROR", "Internal error.");
  };
};

