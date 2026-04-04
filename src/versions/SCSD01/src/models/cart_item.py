from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Literal

from src.lib.money import Money

Status = Literal["ACTIVE", "SAVED"]


@dataclass(frozen=True)
class CartItem:
    sku: str
    unit_price: Money
    quantity: int
    status: Status = "ACTIVE"

    def with_quantity(self, quantity: int) -> "CartItem":
        if quantity <= 0:
            raise ValueError("quantity must be positive")
        return replace(self, quantity=quantity)

    def save_for_later(self) -> "CartItem":
        return replace(self, status="SAVED")

    @property
    def line_total(self) -> Money:
        return self.unit_price * self.quantity
