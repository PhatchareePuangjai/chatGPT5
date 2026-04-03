from datetime import datetime

from backend.src.pricing.evaluator import Cart, CartItem, evaluate_pricing


def test_expired_coupon_rejected():
    cart = Cart(
        cart_id="cart-3",
        customer_id="cust-1",
        currency="THB",
        items=[CartItem(product_id="sku-1", quantity=1, unit_price=1000)],
        subtotal=1000,
    )
    now = datetime.utcnow()
    result = evaluate_pricing(cart, coupon_code="EXPIRED", evaluation_time=now)
    assert result.grand_total == 1000
    assert "Coupon expired" in result.messages


def test_usage_limit_rejected():
    cart = Cart(
        cart_id="cart-4",
        customer_id="cust-1",
        currency="THB",
        items=[CartItem(product_id="sku-1", quantity=1, unit_price=1000)],
        subtotal=1000,
    )
    result = evaluate_pricing(
        cart,
        coupon_code="WELCOME",
        usage_count=lambda _: 1,
    )
    assert result.grand_total == 1000
    assert "Usage limit reached" in result.messages
