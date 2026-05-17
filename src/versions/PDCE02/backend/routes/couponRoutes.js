const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.post('/validate', couponController.validateCoupons);

module.exports = router;
