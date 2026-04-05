from lib.money import format_minor, to_minor


def test_money_precision_round_trip():
    minor = to_minor("19.99")
    assert minor == 1999
    assert format_minor(minor * 3) == "59.97"


def test_money_format_two_decimals():
    assert format_minor(10000) == "100.00"
