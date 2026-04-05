from cart.models import Cart, CartItem
from cart.totals import calculate_cart_total, calculate_line_total


def test_cart_total_updates_with_quantity():
    cart = Cart(currency="THB")
    item = CartItem(sku="A", name="Item A", unit_price_minor=10000, quantity=3)
    cart.items.append(item)

    assert calculate_line_total(item) == 30000
    assert calculate_cart_total(cart) == 30000
