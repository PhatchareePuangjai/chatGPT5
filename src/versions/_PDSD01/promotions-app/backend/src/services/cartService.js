const cartRepository = require('../repositories/cartRepository');
const { sumCents, clampZero } = require('../utils/money');

function serializeDiscount(discount) {
  return {
    code: discount.coupon_code,
    amount_cents: discount.amount_cents,
    priority: discount.priority,
    type: discount.discount_type,
    reason: discount.reason,
    created_at: discount.created_at,
  };
}

async function getCartSummary(userId) {
  const cart = await cartRepository.getCartByUserId(userId);
  if (!cart) {
    return null;
  }
  const discounts = await cartRepository.getDiscounts(cart.id);
  const discountTotal = sumCents(discounts.map((d) => d.amount_cents));
  const grandTotal = clampZero(cart.subtotal_cents - discountTotal);
  return {
    user_id: cart.user_id,
    subtotal_cents: cart.subtotal_cents,
    discount_total_cents: discountTotal,
    grand_total_cents: grandTotal,
    currency: cart.currency,
    discounts: discounts.map(serializeDiscount),
  };
}

module.exports = { getCartSummary };
