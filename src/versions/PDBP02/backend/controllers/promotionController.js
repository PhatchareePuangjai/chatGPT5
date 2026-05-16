const Coupon = require("../models/Coupon");

exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || !cartTotal) {
      return res.status(400).json({ message: "Code and cart total required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is inactive" });
    }

    if (new Date() > coupon.expirationDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    const discountAmount =
      (cartTotal * coupon.discountPercentage) / 100;

    const newTotal = cartTotal - discountAmount;

    return res.status(200).json({
      message: "Coupon applied successfully",
      originalTotal: cartTotal,
      discountPercentage: coupon.discountPercentage,
      discountAmount,
      newTotal
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
