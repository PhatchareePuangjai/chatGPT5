from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List


@dataclass(frozen=True)
class DiscountRule:
    order: int


PERCENTAGE_ORDER = 1
FIXED_ORDER = 2


def order_discounts(discounts: Iterable["DiscountLineItem"]) -> List["DiscountLineItem"]:
    return sorted(discounts, key=lambda item: item.order)
