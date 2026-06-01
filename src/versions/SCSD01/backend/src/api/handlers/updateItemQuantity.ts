import type { Request, Response } from 'express';
import { setItemQuantity } from '../../services/cartMutationService.js';
import { getCart } from '../../services/cartReadService.js';

// For now, cart identity is passed as a header for simplicity.
// A real system would derive this from auth/session.
function getCartId(req: Request): string {
  const cartId = req.header('x-cart-id');
  if (!cartId) throw new Error('x-cart-id header required');
  return cartId;
}

export async function updateItemQuantityHandler(req: Request, res: Response): Promise<void> {
  const cartId = getCartId(req);
  const sku = req.params.sku;
  const quantity = Number(req.body?.quantity);

  await setItemQuantity({ cartId, sku, quantity });
  const view = await getCart(cartId);
  res.json(view);
}

