import { Router } from 'express';
import { asyncHandler } from '../middleware/validate';
import { computeTotals } from '../../services/promotions/engine';
import { listActivePromotions } from '../../models/promotionRepo';

export const checkoutTotalsRouter = Router();

checkoutTotalsRouter.get(
  '/totals',
  asyncHandler(async (req, res) => {
    const cartId = typeof req.query.cartId === 'string' ? req.query.cartId : 'demo-cart';
    const cart = {
      cartId,
      userId: 'demo-user',
      currency: 'THB' as const,
      subtotalSatang: 200000, // demo cart for now
    };

    const engine = computeTotals({ cart, promotions: listActivePromotions() });
    res.json({ totals: engine.totals, discountLines: engine.discountLines });
  }),
);

