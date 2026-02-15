const express = require("express");
const { applyCoupon } = require("../controllers/applyCouponController");
const { createOrder, getOrder } = require("../controllers/ordersController");

const router = express.Router();

router.post("/apply-coupon", applyCoupon);

// Small helper endpoints for demo UI
router.post("/orders", createOrder);
router.get("/orders/:id", getOrder);

module.exports = router;
