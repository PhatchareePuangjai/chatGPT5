import type { Response } from "express";

export function respondOk(res: Response, data: unknown) {
  res.status(200).json({ data });
}

export function respondError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  res.status(status).json({
    error: {
      code,
      message,
      details: details ?? {}
    }
  });
}

