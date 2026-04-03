from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Callable, Optional

from .messages import COUPON_APPLIED, COUPON_EXPIRED, MINIMUM_SPEND_NOT_MET, USAGE_LIMIT_REACHED


@dataclass(frozen=True)
class CouponDefinition:
    code: str
    discount_value: int
    minimum_spend: int
    expires_at: Optional[datetime]
    usage_limit_per_customer: Optional[int]


def validate_minimum_spend(subtotal: int, minimum_spend: int) -> bool:
    return subtotal >= minimum_spend


def is_expired(expires_at: Optional[datetime], now: datetime) -> bool:
    return expires_at is not None and expires_at < now


def default_coupon_lookup(code: str) -> Optional[CouponDefinition]:
    now = datetime.utcnow()
    coupons = {
        "SAVE100": CouponDefinition(
            code="SAVE100",
            discount_value=100,
            minimum_spend=500,
            expires_at=now + timedelta(days=1),
            usage_limit_per_customer=1,
        ),
        "EXPIRED": CouponDefinition(
            code="EXPIRED",
            discount_value=100,
            minimum_spend=0,
            expires_at=now - timedelta(days=1),
            usage_limit_per_customer=1,
        ),
        "WELCOME": CouponDefinition(
            code="WELCOME",
            discount_value=100,
            minimum_spend=0,
            expires_at=now + timedelta(days=30),
            usage_limit_per_customer=1,
        ),
    }
    return coupons.get(code)


def apply_coupon(
    subtotal: int,
    coupon_code: str,
    now: datetime,
    usage_count: Optional[Callable[[str], int]] = None,
    coupon_lookup: Callable[[str], Optional[CouponDefinition]] = default_coupon_lookup,
) -> tuple[Optional[int], str]:
    coupon = coupon_lookup(coupon_code)
    if coupon is None:
        return None, MINIMUM_SPEND_NOT_MET
    if is_expired(coupon.expires_at, now):
        return None, COUPON_EXPIRED
    if not validate_minimum_spend(subtotal, coupon.minimum_spend):
        return None, MINIMUM_SPEND_NOT_MET
    if coupon.usage_limit_per_customer is not None and usage_count is not None:
        if usage_count(coupon_code) >= coupon.usage_limit_per_customer:
            return None, USAGE_LIMIT_REACHED
    return coupon.discount_value, COUPON_APPLIED
