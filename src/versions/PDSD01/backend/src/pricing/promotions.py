from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

from .calculations import apply_percentage


@dataclass(frozen=True)
class PromotionDefinition:
    promo_id: str
    percent: float


def calculate_percentage_discount(subtotal: int, percent: float) -> int:
    return apply_percentage(subtotal, percent)


def apply_promotions(subtotal: int, promotions: Iterable[PromotionDefinition]) -> List[int]:
    return [calculate_percentage_discount(subtotal, promo.percent) for promo in promotions]
