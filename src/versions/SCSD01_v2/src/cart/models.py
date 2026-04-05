from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional


@dataclass
class CartItem:
    sku: str
    name: str
    unit_price_minor: int
    quantity: int

    @property
    def line_total_minor(self) -> int:
        return self.unit_price_minor * self.quantity


@dataclass
class SavedItem:
    sku: str
    name: str
    unit_price_minor: int
    saved_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Cart:
    currency: str
    items: List[CartItem] = field(default_factory=list)
    saved_items: List[SavedItem] = field(default_factory=list)

    def find_item(self, sku: str) -> Optional[CartItem]:
        for item in self.items:
            if item.sku == sku:
                return item
        return None

    def remove_item(self, sku: str) -> Optional[CartItem]:
        for index, item in enumerate(self.items):
            if item.sku == sku:
                return self.items.pop(index)
        return None
