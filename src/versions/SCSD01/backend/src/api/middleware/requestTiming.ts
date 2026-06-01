import type { NextFunction, Request, Response } from 'express';
import { log } from '../../lib/logger.js';

export function requestTiming(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    log('info', 'request.complete', {
      request_id: (req as any).requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: durationMs
    });
  });
  next();
}

