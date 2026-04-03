from backend.src.pricing import evaluator


def test_total_clamps_to_zero():
    assert evaluator.apply_fixed_coupon_discount(50, 100) == 0
