from __future__ import annotations

from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class InventorySnapshot:
    stock_by_sku: Dict[str, int]

    def available(self, sku: str) -> int:
        return self.stock_by_sku.get(sku, 0)

    def can_add(self, sku: str, current_qty: int, requested_qty: int) -> bool:
        return (current_qty + requested_qty) <= self.available(sku)
