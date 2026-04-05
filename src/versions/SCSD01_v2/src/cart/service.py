from __future__ import annotations

from .errors import InsufficientStockError, ItemNotFoundError
from .models import Cart, CartItem, SavedItem


def add_item(
    cart: Cart,
    sku: str,
    name: str,
    unit_price_minor: int,
    quantity: int,
    available_stock: int,
) -> Cart:
    if quantity <= 0:
        raise ValueError("quantity must be positive")

    existing = cart.find_item(sku)
    current_qty = existing.quantity if existing else 0
    if current_qty + quantity > available_stock:
        raise InsufficientStockError("insufficient stock")

    if existing:
        existing.quantity += quantity
    else:
        cart.items.append(
            CartItem(
                sku=sku,
                name=name,
                unit_price_minor=unit_price_minor,
                quantity=quantity,
            )
        )
    return cart


def update_quantity(cart: Cart, sku: str, quantity: int, available_stock: int) -> Cart:
    if quantity <= 0:
        raise ValueError("quantity must be positive")

    item = cart.find_item(sku)
    if item is None:
        raise ItemNotFoundError("item not found")

    if quantity > available_stock:
        raise InsufficientStockError("insufficient stock")

    item.quantity = quantity
    return cart


def save_for_later(cart: Cart, sku: str) -> Cart:
    item = cart.remove_item(sku)
    if item is None:
        raise ItemNotFoundError("item not found")

    cart.saved_items.append(
        SavedItem(
            sku=item.sku,
            name=item.name,
            unit_price_minor=item.unit_price_minor,
        )
    )
    return cart
