import type { RequestHandler } from 'express';

import { getPricingForCart } from '../../services/pricing/getPricing.js';

export const getPricing: RequestHandler = async (req, res) => {
  const cartId = req.params.cartId;
  const result = await getPricingForCart({ cartId, userId: req.header('x-user-id') ?? null });
  res.status(200).json(result);
};

