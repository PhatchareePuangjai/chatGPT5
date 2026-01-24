const express = require('express');
const cartRoutes = require('./cartRoutes');
const promotionRoutes = require('./promotionRoutes');

const router = express.Router();

router.use('/cart', cartRoutes);
router.use('/promotions', promotionRoutes);

module.exports = router;
