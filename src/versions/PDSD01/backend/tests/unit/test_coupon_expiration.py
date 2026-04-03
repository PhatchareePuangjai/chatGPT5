from datetime import datetime, timedelta

from backend.src.pricing import coupons


def test_coupon_expired():
    now = datetime.utcnow()
    assert coupons.is_expired(now - timedelta(days=1), now) is True
