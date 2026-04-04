from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Iterable, List

from src.lib.money import Money
from src.models.cart_item import CartItem


@dataclass(frozen=True)
class Cart:
    items: List[CartItem]

    @classmethod
    def empty(cls) -> "Cart":
        return cls(items=[])

    def with_items(self, items: Iterable[CartItem]) -> "Cart":
        return replace(self, items=list(items))

    def active_items(self) -> List[CartItem]:
        return [item for item in self.items if item.status == "ACTIVE"]

    def saved_items(self) -> List[CartItem]:
        return [item for item in self.items if item.status == "SAVED"]

    def total(self) -> Money:
        total_cents = sum(item.line_total.cents for item in self.active_items())
        return Money(total_cents)
