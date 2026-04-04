from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

_DECIMAL_PLACES = Decimal("0.01")


def to_cents(amount: Any) -> int:
    """Convert a numeric amount to integer cents with fixed 2-decimal rounding."""
    if isinstance(amount, Decimal):
        value = amount
    else:
        value = Decimal(str(amount))
    quantized = value.quantize(_DECIMAL_PLACES, rounding=ROUND_HALF_UP)
    return int(quantized * 100)


def format_cents(cents: int) -> str:
    """Format integer cents as a 2-decimal string."""
    sign = "-" if cents < 0 else ""
    cents = abs(cents)
    whole = cents // 100
    fractional = cents % 100
    return f"{sign}{whole}.{fractional:02d}"


@dataclass(frozen=True)
class Money:
    cents: int

    @classmethod
    def from_amount(cls, amount: Any) -> "Money":
        return cls(to_cents(amount))

    def __add__(self, other: "Money") -> "Money":
        return Money(self.cents + other.cents)

    def __mul__(self, quantity: int) -> "Money":
        return Money(self.cents * quantity)

    def format(self) -> str:
        return format_cents(self.cents)
