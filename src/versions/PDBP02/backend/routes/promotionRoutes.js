const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");

router.post("/apply-coupon", promotionController.applyCoupon);

module.exports = router;
