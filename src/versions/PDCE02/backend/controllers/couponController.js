const pool = require('../db');
const applyDiscounts = require('../utils/discountCalculator');

exports.validateCoupons = async (req, res) => {
  const { userId, cartTotal, couponCodes } = req.body;

  if (!couponCodes || !couponCodes.length)
    return res.status(400).json({ message: "No coupons provided" });

  try {
    const validCoupons = [];

    for (let code of couponCodes) {
      const result = await pool.query(
        'SELECT * FROM coupons WHERE code=$1 AND is_active=true',
        [code]
      );

      if (!result.rows.length) continue;

      const coupon = result.rows[0];

      if (new Date(coupon.expiration_date) < new Date()) continue;

      validCoupons.push(coupon);
    }

    if (!validCoupons.length)
      return res.status(400).json({ message: "No valid coupons applied" });

    const finalTotal = applyDiscounts(cartTotal, validCoupons);

    res.json({
      originalTotal: cartTotal,
      finalTotal,
      appliedCoupons: validCoupons.map(c => c.code)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
