const express = require('express');
const cartService = require('../services/cartService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.userId || 'demo-user';
    const cart = await cartService.getCartSummary(userId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    return res.json(cart);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
