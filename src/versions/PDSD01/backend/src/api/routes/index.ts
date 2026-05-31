import express from 'express';

import { postCoupon } from './coupons.post.js';
import { deleteCoupon } from './coupons.delete.js';
import { getPricing } from './pricing.get.js';

export const routes = express.Router();

routes.post('/carts/:cartId/coupon', postCoupon);
routes.delete('/carts/:cartId/coupon', deleteCoupon);
routes.get('/carts/:cartId/pricing', getPricing);

