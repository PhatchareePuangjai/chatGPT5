from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

from src.lib.money import Money
from src.models.cart import Cart
from src.models.cart_item import CartItem
from src.services.inventory_service import InventorySnapshot

STOCK_EXCEEDED_MESSAGE = "สินค้าไม่เพียงพอ"


@dataclass
class CartResult:
    cart: Cart
    error: Optional[str] = None


class CartService:
    def __init__(self, inventory: InventorySnapshot) -> None:
        self.inventory = inventory

    def add_item(self, cart: Cart, sku: str, unit_price: Money, quantity: int) -> CartResult:
        items = list(cart.items)
        index = self._find_active_index(items, sku)
        current_qty = items[index].quantity if index is not None else 0

        if not self.inventory.can_add(sku, current_qty, quantity):
            return CartResult(cart=cart, error=STOCK_EXCEEDED_MESSAGE)

        if index is None:
            items.append(CartItem(sku=sku, unit_price=unit_price, quantity=quantity))
        else:
            existing = items[index]
            items[index] = existing.with_quantity(existing.quantity + quantity)

        return CartResult(cart=cart.with_items(items))

    def update_quantity(self, cart: Cart, sku: str, new_quantity: int) -> CartResult:
        items = list(cart.items)
        index = self._find_active_index(items, sku)
        if index is None:
            return CartResult(cart=cart, error="item not found")

        current_qty = 0
        if not self.inventory.can_add(sku, current_qty, new_quantity):
            return CartResult(cart=cart, error=STOCK_EXCEEDED_MESSAGE)

        items[index] = items[index].with_quantity(new_quantity)
        return CartResult(cart=cart.with_items(items))

    def save_for_later(self, cart: Cart, sku: str) -> CartResult:
        items = list(cart.items)
        index = self._find_active_index(items, sku)
        if index is None:
            return CartResult(cart=cart, error="item not found")

        items[index] = items[index].save_for_later()
        return CartResult(cart=cart.with_items(items))

    def summary(self, cart: Cart) -> Dict[str, List[CartItem] | Money]:
        return {
            "active_items": cart.active_items(),
            "saved_items": cart.saved_items(),
            "total": cart.total(),
        }

    @staticmethod
    def _find_active_index(items: List[CartItem], sku: str) -> Optional[int]:
        for idx, item in enumerate(items):
            if item.sku == sku and item.status == "ACTIVE":
                return idx
        return None
