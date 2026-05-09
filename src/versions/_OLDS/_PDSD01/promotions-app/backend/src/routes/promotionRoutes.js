const express = require('express');
const { z } = require('zod');
const promotionService = require('../services/promotionService');
const cartService = require('../services/cartService');

const router = express.Router();

const applySchema = z.object({
  couponCode: z.string().min(1, 'ต้องระบุรหัสคูปอง'),
  userId: z.string().optional(),
});

router.post('/apply', async (req, res, next) => {
  try {
    const parsed = applySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message, reason: 'validation_error' });
    }
    const payload = parsed.data;
    const userId = payload.userId || 'demo-user';
    const result = await promotionService.applyCoupon({ userId, couponCode: payload.couponCode });
    const cart = await cartService.getCartSummary(userId);
    return res.json({
      message: result.message,
      applied_discount_cents: result.discountAmount,
      cart,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
