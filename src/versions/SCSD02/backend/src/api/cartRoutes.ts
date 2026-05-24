import { Router } from 'express';
import { CartService } from '../services/cartService.js';
import { validateBody, schemas } from '../middleware/validate.js';

export function makeCartRoutes(deps: { cartService: CartService }) {
  const r = Router();

  // NOTE: cart identity is assumed; this is a minimal placeholder.
  const CART_ID = 'default';

  r.get('/cart', async (_req, res, next) => {
    try {
      res.json(await deps.cartService.getCart(CART_ID));
    } catch (e) {
      next(e);
    }
  });

  r.post('/cart/items', validateBody(schemas.addItem), async (req, res, next) => {
    try {
      res.json(await deps.cartService.addItem({ cartId: CART_ID, sku: req.body.sku, qty: req.body.qty }));
    } catch (e) {
      next(e);
    }
  });

  r.patch('/cart/items/:sku', validateBody(schemas.setQty), async (req, res, next) => {
    try {
      res.json(await deps.cartService.setItemQty({ cartId: CART_ID, sku: req.params.sku, qty: req.body.qty }));
    } catch (e) {
      next(e);
    }
  });

  r.post('/cart/items/:sku/save', async (req, res, next) => {
    try {
      res.json(await deps.cartService.saveForLater({ cartId: CART_ID, sku: req.params.sku }));
    } catch (e) {
      next(e);
    }
  });

  return r;
}

