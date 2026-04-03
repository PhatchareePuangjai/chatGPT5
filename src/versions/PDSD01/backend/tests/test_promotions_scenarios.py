from datetime import datetime

from backend.src.pricing.evaluator import Cart, CartItem, evaluate_pricing
from backend.src.pricing.messages import (
    COUPON_APPLIED,
    COUPON_EXPIRED,
    USAGE_LIMIT_REACHED,
)
from backend.src.pricing.promotions import PromotionDefinition


def _build_cart(subtotal: int, customer_id: str = "cust-1") -> Cart:
    return Cart(
        cart_id=f"cart-{subtotal}-{customer_id}",
        customer_id=customer_id,
        currency="THB",
        items=[CartItem(product_id="sku-1", quantity=1, unit_price=subtotal)],
        subtotal=subtotal,
    )


class TestPromotionsScenarios:
    def test_1_coupon_validation(self):
        """Scenario 1: Coupon Validation."""
        cart = _build_cart(1000)

        result = evaluate_pricing(cart, coupon_code="SAVE100")

        assert result.grand_total == 900
        assert COUPON_APPLIED in result.messages
        assert len(result.discount_line_items) == 1
        assert result.discount_line_items[0].type == "coupon"
        assert result.discount_line_items[0].source_id == "SAVE100"
        assert result.discount_line_items[0].amount == 100

    def test_2_cart_total_discount_percent(self):
        """Scenario 2: Cart Total Discount %."""
        cart = _build_cart(2000)
        promo = PromotionDefinition(promo_id="PROMO10", percent=10)

        result = evaluate_pricing(cart, promotions=[promo])

        assert result.grand_total == 1800
        assert len(result.discount_line_items) == 1
        assert result.discount_line_items[0].type == "promotion"
        assert result.discount_line_items[0].source_id == "PROMO10"
        assert result.discount_line_items[0].amount == 200

    def test_3_expiration_date_check(self):
        """Scenario 3: Expiration Date Check."""
        cart = _build_cart(1000)

        result = evaluate_pricing(
            cart,
            coupon_code="EXPIRED",
            evaluation_time=datetime.utcnow(),
        )

        assert result.grand_total == 1000
        assert COUPON_EXPIRED in result.messages
        assert result.discount_line_items == []


class TestPromotionsEdgeCases:
    def test_edge_1_coupon_usage_limit(self):
        """Edge Case 1: Coupon Usage Limit."""
        cart = _build_cart(1000)

        result = evaluate_pricing(
            cart,
            coupon_code="WELCOME",
            usage_count=lambda _: 1,
        )

        assert result.grand_total == 1000
        assert USAGE_LIMIT_REACHED in result.messages
        assert result.discount_line_items == []

    def test_edge_2_order_of_operations(self):
        """Edge Case 2: Order of Operations."""
        cart = _build_cart(1000)
        promo = PromotionDefinition(promo_id="PROMO10", percent=10)

        result = evaluate_pricing(
            cart,
            coupon_code="SAVE100",
            promotions=[promo],
        )

        assert [item.type for item in result.discount_line_items] == ["promotion", "coupon"]
        assert [item.amount for item in result.discount_line_items] == [100, 100]
        assert result.grand_total == 800

    def test_edge_3_negative_total_protection(self):
        """Edge Case 3: Negative Total Protection."""
        cart = _build_cart(50, customer_id="cust-2")

        result = evaluate_pricing(cart, coupon_code="WELCOME")

        assert result.grand_total == 0
