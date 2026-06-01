import express from 'express';
import { requestContext } from './middleware/requestContext.js';
import { requestTiming } from './middleware/requestTiming.js';
import { cartRouter } from './cart.routes.js';
import { applyMigrations } from '../lib/migrations.js';
import { AppError } from './errors.js';
import { log } from '../lib/logger.js';

const app = express();
app.use(express.json());

// Minimal CORS for local dev (frontend on a different origin/port).
app.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type,x-cart-id,x-request-id');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(requestContext);
app.use(requestTiming);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/cart', cartRouter);

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    log('warn', 'request.error', {
      request_id: (req as any).requestId,
      code: err.code,
      message: err.message,
      details: err.details
    });
    return res.status(err.httpStatus).json({ code: err.code, message: err.userMessage });
  }

  log('error', 'request.error', { request_id: (req as any).requestId, err: String(err) });
  return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal error' });
});

const port = Number(process.env.PORT ?? 3001);

async function main(): Promise<void> {
  await applyMigrations();
  app.listen(port, () => {
    log('info', 'server.listening', { port });
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
