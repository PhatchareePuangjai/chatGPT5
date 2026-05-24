import { randomUUID } from 'node:crypto';

export function requestLogging() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const reqId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    req.id = reqId;
    res.setHeader('x-request-id', reqId);

    res.on('finish', () => {
      const ms = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          level: 'info',
          msg: 'request',
          req_id: reqId,
          method: req.method,
          path: req.originalUrl ?? req.url,
          status: res.statusCode,
          duration_ms: ms,
        }),
      );
    });

    next();
  };
}

