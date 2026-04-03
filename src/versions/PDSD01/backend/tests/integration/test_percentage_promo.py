from backend.src.pricing.evaluator import Cart, CartItem, evaluate_pricing
from backend.src.pricing.promotions import PromotionDefinition


def test_percentage_promo_applied():
    cart = Cart(
        cart_id="cart-2",
        customer_id="cust-1",
        currency="THB",
        items=[CartItem(product_id="sku-1", quantity=1, unit_price=2000)],
        subtotal=2000,
    )
    promo = PromotionDefinition(promo_id="PROMO10", percent=10)
    result = evaluate_pricing(cart, promotions=[promo])
    assert result.grand_total == 1800
