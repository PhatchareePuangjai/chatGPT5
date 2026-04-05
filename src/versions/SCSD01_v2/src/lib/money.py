from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP


_MINOR_UNIT = Decimal("0.01")


def to_minor(amount: str | Decimal) -> int:
    """Convert a decimal string amount into minor units (e.g., 19.99 -> 1999)."""
    value = Decimal(str(amount)).quantize(_MINOR_UNIT, rounding=ROUND_HALF_UP)
    return int(value * 100)


def format_minor(amount_minor: int) -> str:
    """Format minor units as a two-decimal string."""
    value = Decimal(amount_minor) / Decimal(100)
    return f"{value:.2f}"
