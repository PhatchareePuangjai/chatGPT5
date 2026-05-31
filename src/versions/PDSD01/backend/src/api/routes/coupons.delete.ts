import type { RequestHandler } from 'express';

import { removeCouponFromCart } from '../../services/coupons/applyCoupon.js';

export const deleteCoupon: RequestHandler = async (req, res) => {
  const cartId = req.params.cartId;
  const result = await removeCouponFromCart({ cartId });
  res.status(200).json(result);
};

