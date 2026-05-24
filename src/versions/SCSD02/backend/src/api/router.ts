import { Router } from 'express';
import type { CartService } from '../services/cartService.js';
import { makeCartRoutes } from './cartRoutes.js';

export function makeRouter(deps: { cartService: CartService }) {
  const r = Router();
  r.use(makeCartRoutes({ cartService: deps.cartService }));
  return r;
}

