import type { RequestHandler } from 'express';

import { requireString } from '../validation.js';
import { applyCouponToCart } from '../../services/coupons/applyCoupon.js';

export const postCoupon: RequestHandler = async (req, res) => {
  const cartId = req.params.cartId;
  const code = requireString(req.body, 'code');
  const result = await applyCouponToCart({ cartId, code, userId: req.header('x-user-id') ?? null });
  res.status(200).json(result);
};

