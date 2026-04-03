from backend.src.pricing import coupons


def test_validate_minimum_spend_passes():
    assert coupons.validate_minimum_spend(1000, 500) is True


def test_validate_minimum_spend_fails():
    assert coupons.validate_minimum_spend(400, 500) is False
