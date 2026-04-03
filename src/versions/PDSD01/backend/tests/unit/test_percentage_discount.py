from backend.src.pricing import promotions


def test_percentage_discount_calculation():
    assert promotions.calculate_percentage_discount(2000, 10) == 200
