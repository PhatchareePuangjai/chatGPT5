from src.lib.money import Money
from src.models.cart import Cart
from src.services.cart_service import CartService, STOCK_EXCEEDED_MESSAGE
from src.services.inventory_service import InventorySnapshot


def _service(stock_by_sku: dict[str, int]) -> CartService:
    return CartService(InventorySnapshot(stock_by_sku=stock_by_sku))


class TestCartScenarios:
    def test_1_update_item_quantity(self):
        """Scenario 1: Update Item Quantity."""
        service = _service({"SKU-001": 10})
        cart = Cart.empty()

        result = service.add_item(cart, "SKU-001", Money.from_amount("100.00"), 1)
        result = service.update_quantity(result.cart, "SKU-001", 3)

        assert result.error is None
        summary = service.summary(result.cart)
        active_item = summary["active_items"][0]
        assert active_item.quantity == 3
        assert active_item.line_total.cents == 30000
        assert summary["total"].cents == 30000

    def test_2_merge_items_logic(self):
        """Scenario 2: Merge Items Logic."""
        service = _service({"SKU-001": 5})
        cart = Cart.empty()

        result = service.add_item(cart, "SKU-001", Money.from_amount("100.00"), 1)
        result = service.add_item(result.cart, "SKU-001", Money.from_amount("100.00"), 2)

        assert result.error is None
        summary = service.summary(result.cart)
        active_items = summary["active_items"]
        assert len(active_items) == 1
        assert active_items[0].quantity == 3
        assert summary["total"].cents == 30000

    def test_3_save_for_later(self):
        """Scenario 3: Save for Later."""
        service = _service({"SKU-005": 5})
        cart = Cart.empty()

        result = service.add_item(cart, "SKU-005", Money.from_amount("50.00"), 1)
        result = service.save_for_later(result.cart, "SKU-005")

        assert result.error is None
        summary = service.summary(result.cart)
        assert summary["active_items"] == []
        assert summary["total"].cents == 0
        assert len(summary["saved_items"]) == 1
        assert summary["saved_items"][0].sku == "SKU-005"
        assert summary["saved_items"][0].quantity == 1


class TestCartEdgeCases:
    def test_edge_case_1_add_more_than_stock(self):
        """Edge Case 1: Add More Than Stock."""
        service = _service({"SKU-005": 5})
        cart = Cart.empty()

        result = service.add_item(cart, "SKU-005", Money.from_amount("50.00"), 3)
        blocked = service.add_item(result.cart, "SKU-005", Money.from_amount("50.00"), 3)

        assert blocked.error == STOCK_EXCEEDED_MESSAGE
        summary = service.summary(blocked.cart)
        assert len(summary["active_items"]) == 1
        assert summary["active_items"][0].quantity == 3
        assert summary["total"].cents == 15000

    def test_edge_case_2_floating_point_calculation(self):
        """Edge Case 2: Floating Point Calculation."""
        service = _service({"SKU-006": 100})
        cart = Cart.empty()

        result = service.add_item(cart, "SKU-006", Money.from_amount("19.99"), 3)

        assert result.error is None
        summary = service.summary(result.cart)
        assert summary["active_items"][0].line_total.cents == 5997
        assert summary["total"].cents == 5997
        assert summary["total"].format() == "59.97"
