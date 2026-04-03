from __future__ import annotations


def round_currency(value: float) -> int:
    return int(round(value))


def apply_percentage(amount: int, percent: float) -> int:
    return round_currency(amount * (percent / 100.0))


def apply_fixed(amount: int, discount: int) -> int:
    return max(0, amount - discount)


def clamp_total(total: int) -> int:
    return max(0, total)
