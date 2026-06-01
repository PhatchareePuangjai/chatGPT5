import type { Request, Response } from 'express';
import { addItem } from '../../services/cartMutationService.js';
import { getCart } from '../../services/cartReadService.js';

function getCartId(req: Request): string {
  const cartId = req.header('x-cart-id');
  if (!cartId) throw new Error('x-cart-id header required');
  return cartId;
}

export async function addToCartHandler(req: Request, res: Response): Promise<void> {
  const cartId = getCartId(req);
  const sku = String(req.body?.sku ?? '');
  const quantity = Number(req.body?.quantity);

  // Placeholder pricing: in a real system this comes from a product catalog.
  const unitPriceMinor = Number(req.body?.unit_price_minor ?? 0);
  await addItem({ cartId, sku, quantity, unitPriceMinor });

  const view = await getCart(cartId);
  res.status(201).json(view);
}

