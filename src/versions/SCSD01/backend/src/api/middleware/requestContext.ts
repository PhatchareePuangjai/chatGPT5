import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  // eslint-disable-next-line no-var
  var __requestId: string | undefined;
}

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const reqId = req.header('x-request-id') ?? randomUUID();
  res.setHeader('x-request-id', reqId);
  (req as any).requestId = reqId;
  next();
}

