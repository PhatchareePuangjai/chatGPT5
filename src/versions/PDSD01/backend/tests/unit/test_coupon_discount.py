from backend.src.pricing import evaluator


def test_apply_fixed_coupon_discount():
    assert evaluator.apply_fixed_coupon_discount(1000, 100) == 900
