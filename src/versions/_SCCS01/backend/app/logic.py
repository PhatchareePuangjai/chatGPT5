from __future__ import annotations

from .models import Cart, CartItemStatus
from .schemas import CartItemOut, CartOut


def _cart_item_to_out(item) -> CartItemOut:
    return CartItemOut(
        id=item.id,
        status=item.status.value,
        sku=item.product.sku,
        name=item.product.name,
        price_cents=item.product.price_cents,
        quantity=item.quantity,
        line_total_cents=item.product.price_cents * item.quantity,
    )


def cart_to_out(cart: Cart) -> CartOut:
    active = [i for i in cart.items if i.status == CartItemStatus.ACTIVE]
    saved = [i for i in cart.items if i.status == CartItemStatus.SAVED]

    active_items = [_cart_item_to_out(i) for i in sorted(active, key=lambda x: x.id)]
    saved_items = [_cart_item_to_out(i) for i in sorted(saved, key=lambda x: x.id)]

    grand_total_cents = sum(i.line_total_cents for i in active_items)
    return CartOut(
        id=cart.id,
        active_items=active_items,
        saved_items=saved_items,
        grand_total_cents=grand_total_cents,
    )

