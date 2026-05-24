import express from 'express';
import { json } from 'express';
import { makeRouter } from './api/router.js';
import { mapErrorToApiError } from './api/errors.js';
import { InMemoryCartRepo } from './db/repos/cartRepo.js';
import { InMemoryProductRepo } from './db/repos/productRepo.js';
import { CartService } from './services/cartService.js';
import { requestLogging } from './middleware/logging.js';

export function makeApp() {
  const app = express();
  app.use(json());
  app.use(requestLogging());

  // For this version, wire a simple in-memory persistence layer so tests run without Postgres.
  const cartRepo = new InMemoryCartRepo({ currency: 'THB' });
  const productRepo = new InMemoryProductRepo([
    { sku: 'SKU-001', unitPriceMinor: 10000, availableStockQty: 5 },
    { sku: 'SKU-005', unitPriceMinor: 5000, availableStockQty: 10 },
    { sku: 'A', unitPriceMinor: 10000, availableStockQty: 99 }
  ]);
  const cartService = new CartService({ cartRepo, productRepo });

  app.use(makeRouter({ cartService }));

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: any, res: any, _next: any) => {
    const apiErr = mapErrorToApiError(err);
    res.status(apiErr.status).json({ error: { code: apiErr.code, message: apiErr.message } });
  });

  return { app, deps: { cartRepo, productRepo, cartService } };
}
