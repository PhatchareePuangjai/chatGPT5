import pytest

from cart.errors import InsufficientStockError
from cart.models import Cart
from cart.service import add_item, save_for_later, update_quantity
from cart.totals import calculate_cart_total, calculate_line_total
from lib.money import format_minor, to_minor


class TestCartScenarios:
    def test_1_update_item_quantity(self):
        cart = Cart(currency="THB")
        add_item(
            cart,
            sku="A",
            name="Item A",
            unit_price_minor=to_minor("100.00"),
            quantity=1,
            available_stock=10,
        )

        update_quantity(cart, sku="A", quantity=3, available_stock=10)

        item = cart.items[0]
        assert item.quantity == 3
        assert calculate_line_total(item) == to_minor("300.00")
        assert calculate_cart_total(cart) == to_minor("300.00")

    def test_2_merge_items_logic(self):
        cart = Cart(currency="THB")
        add_item(
            cart,
            sku="SKU-001",
            name="Item",
            unit_price_minor=to_minor("100.00"),
            quantity=1,
            available_stock=5,
        )

        add_item(
            cart,
            sku="SKU-001",
            name="Item",
            unit_price_minor=to_minor("100.00"),
            quantity=2,
            available_stock=5,
        )

        assert len(cart.items) == 1
        assert cart.items[0].quantity == 3
        assert calculate_cart_total(cart) == to_minor("300.00")

    def test_3_save_for_later(self):
        cart = Cart(currency="THB")
        add_item(
            cart,
            sku="SKU-005",
            name="Saved",
            unit_price_minor=to_minor("50.00"),
            quantity=1,
            available_stock=5,
        )

        save_for_later(cart, sku="SKU-005")

        assert cart.items == []
        assert calculate_cart_total(cart) == 0
        assert len(cart.saved_items) == 1
        assert cart.saved_items[0].sku == "SKU-005"


class TestCartEdgeCases:
    def test_edge_case_1_add_more_than_stock(self):
        cart = Cart(currency="THB")
        add_item(
            cart,
            sku="SKU-005",
            name="Limited Item",
            unit_price_minor=to_minor("50.00"),
            quantity=3,
            available_stock=5,
        )

        with pytest.raises(InsufficientStockError, match="insufficient stock"):
            add_item(
                cart,
                sku="SKU-005",
                name="Limited Item",
                unit_price_minor=to_minor("50.00"),
                quantity=3,
                available_stock=5,
            )

        assert len(cart.items) == 1
        assert cart.items[0].quantity == 3
        assert calculate_cart_total(cart) == to_minor("150.00")

    def test_edge_case_2_floating_point_calculation(self):
        cart = Cart(currency="THB")
        add_item(
            cart,
            sku="SKU-006",
            name="Decimal Item",
            unit_price_minor=to_minor("19.99"),
            quantity=3,
            available_stock=10,
        )

        item = cart.items[0]
        assert calculate_line_total(item) == 5997
        assert calculate_cart_total(cart) == 5997
        assert format_minor(calculate_cart_total(cart)) == "59.97"
