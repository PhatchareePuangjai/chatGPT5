from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Callable, List, Optional

from .calculations import clamp_total
from .coupons import apply_coupon
from .promotions import PromotionDefinition, calculate_percentage_discount
from .rules import FIXED_ORDER, PERCENTAGE_ORDER, order_discounts


@dataclass(frozen=True)
class CartItem:
    product_id: str
    quantity: int
    unit_price: int


@dataclass(frozen=True)
class Cart:
    cart_id: str
    customer_id: str
    currency: str
    items: List[CartItem]
    subtotal: int


@dataclass(frozen=True)
class DiscountLineItem:
    type: str
    source_id: str
    amount: int
    order: int


@dataclass(frozen=True)
class PricingResult:
    discount_line_items: List[DiscountLineItem]
    grand_total: int
    messages: List[str]


def evaluate_pricing(
    cart: Cart,
    coupon_code: Optional[str] = None,
    promotions: Optional[List[PromotionDefinition]] = None,
    evaluation_time: Optional[datetime] = None,
    usage_count: Optional[Callable[[str], int]] = None,
) -> PricingResult:
    line_items: List[DiscountLineItem] = []
    messages: List[str] = []
    now = evaluation_time or datetime.utcnow()
    if promotions:
        for promo in promotions:
            discount_amount = calculate_percentage_discount(cart.subtotal, promo.percent)
            line_items.append(
                DiscountLineItem(
                    type="promotion",
                    source_id=promo.promo_id,
                    amount=discount_amount,
                    order=discount_order_for("promotion"),
                )
            )
    if coupon_code:
        discount_value, message = apply_coupon(
            cart.subtotal,
            coupon_code,
            now,
            usage_count=usage_count,
        )
        if discount_value:
            line_items.append(
                DiscountLineItem(
                    type="coupon",
                    source_id=coupon_code,
                    amount=discount_value,
                    order=discount_order_for("coupon"),
                )
            )
        if message:
            messages.append(message)
    ordered = order_discounts(line_items)
    total_discount = sum(item.amount for item in ordered)
    return PricingResult(
        discount_line_items=ordered,
        grand_total=clamp_total(cart.subtotal - total_discount),
        messages=messages,
    )


def discount_order_for(type_name: str) -> int:
    if type_name == "promotion":
        return PERCENTAGE_ORDER
    return FIXED_ORDER


def apply_fixed_coupon_discount(subtotal: int, discount_value: int) -> int:
    return max(0, subtotal - discount_value)
