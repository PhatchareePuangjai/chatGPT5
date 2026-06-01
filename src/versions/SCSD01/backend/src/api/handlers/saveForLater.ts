import type { Request, Response } from 'express';
import { saveForLater } from '../../services/cartMutationService.js';
import { getCart } from '../../services/cartReadService.js';

function getCartId(req: Request): string {
  const cartId = req.header('x-cart-id');
  if (!cartId) throw new Error('x-cart-id header required');
  return cartId;
}

export async function saveForLaterHandler(req: Request, res: Response): Promise<void> {
  const cartId = getCartId(req);
  const sku = req.params.sku;
  await saveForLater({ cartId, sku });
  const view = await getCart(cartId);
  res.json(view);
}

