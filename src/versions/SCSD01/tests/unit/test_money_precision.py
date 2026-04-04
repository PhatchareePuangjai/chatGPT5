from src.lib.money import Money, to_cents


def test_from_amount_decimal_precision():
    """Money.from_amount converts decimal string to integer cents without floating-point error."""
    m = Money.from_amount("19.99")
    assert m.cents == 1999


def test_to_cents_rounds_half_up():
    """to_cents rounds 0.005 up to 1 cent (ROUND_HALF_UP)."""
    assert to_cents("0.005") == 1
