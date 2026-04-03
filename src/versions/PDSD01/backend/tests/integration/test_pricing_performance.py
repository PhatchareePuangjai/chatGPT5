import time

from backend.src.pricing.evaluator import Cart, CartItem, evaluate_pricing


def test_pricing_performance_budget():
    cart = Cart(
        cart_id="cart-perf",
        customer_id="cust-1",
        currency="THB",
        items=[CartItem(product_id="sku-1", quantity=1, unit_price=1000)],
        subtotal=1000,
    )
    start = time.perf_counter()
    evaluate_pricing(cart, coupon_code="SAVE100")
    elapsed = time.perf_counter() - start
    assert elapsed < 0.2
