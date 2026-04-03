from __future__ import annotations

from typing import Dict, List

from ..pricing.evaluator import DiscountLineItem, PricingResult


def pricing_result_to_dict(result: PricingResult) -> Dict[str, object]:
    return {
        "discountLineItems": [_line_item_to_dict(item) for item in result.discount_line_items],
        "grandTotal": result.grand_total,
        "messages": list(result.messages),
    }


def _line_item_to_dict(item: DiscountLineItem) -> Dict[str, object]:
    return {
        "type": item.type,
        "sourceId": item.source_id,
        "amount": item.amount,
        "order": item.order,
    }
