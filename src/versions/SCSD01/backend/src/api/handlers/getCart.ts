import type { Request, Response } from 'express';
import { getCart } from '../../services/cartReadService.js';

function getCartId(req: Request): string {
  const cartId = req.header('x-cart-id');
  if (!cartId) throw new Error('x-cart-id header required');
  return cartId;
}

export async function getCartHandler(req: Request, res: Response): Promise<void> {
  const cartId = getCartId(req);
  const view = await getCart(cartId);
  res.json(view);
}

