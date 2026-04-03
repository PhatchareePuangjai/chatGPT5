from backend.src.pricing.evaluator import Cart, CartItem, evaluate_pricing


def test_coupon_apply_success():
    cart = Cart(
        cart_id="cart-1",
        customer_id="cust-1",
        currency="THB",
        items=[CartItem(product_id="sku-1", quantity=1, unit_price=1000)],
        subtotal=1000,
    )
    result = evaluate_pricing(cart, coupon_code="SAVE100")
    assert result.grand_total == 900
    assert "Coupon applied successfully" in result.messages
