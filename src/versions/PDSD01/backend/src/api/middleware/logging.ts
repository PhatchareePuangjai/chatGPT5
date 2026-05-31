import type { RequestHandler } from 'express';

export const requestLogging: RequestHandler = (req, _res, next) => {
  const start = Date.now();
  next();
  const ms = Date.now() - start;
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ at: 'request', method: req.method, path: req.path, ms }));
};

