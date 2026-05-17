function applyDiscounts(cartTotal, coupons) {
  let total = Number(cartTotal);

  const percentageCoupons = coupons.filter(c => c.discount_type === 'PERCENTAGE');
  const flatCoupons = coupons.filter(c => c.discount_type === 'FLAT');

  percentageCoupons.forEach(coupon => {
    total -= (total * coupon.discount_value) / 100;
  });

  flatCoupons.forEach(coupon => {
    total -= coupon.discount_value;
  });

  total = Math.max(0, total);
  return Number(total.toFixed(2));
}

module.exports = applyDiscounts;
