from datetime import datetime

from backend.src.pricing.coupons import apply_coupon
from backend.src.pricing.messages import USAGE_LIMIT_REACHED


def test_usage_limit_reached():
    now = datetime.utcnow()
    discount, message = apply_coupon(
        subtotal=1000,
        coupon_code="WELCOME",
        now=now,
        usage_count=lambda _: 1,
    )
    assert discount is None
    assert message == USAGE_LIMIT_REACHED
