from __future__ import annotations

from .models import Cart, CartItem


def calculate_line_total(item: CartItem) -> int:
    return item.unit_price_minor * item.quantity


def calculate_cart_total(cart: Cart) -> int:
    return sum(calculate_line_total(item) for item in cart.items)
