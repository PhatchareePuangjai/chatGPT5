import pytest

from cart.errors import InsufficientStockError
from cart.models import Cart
from cart.service import add_item, save_for_later


def test_merge_duplicate_items_on_add():
    cart = Cart(currency="THB")

    add_item(cart, sku="SKU-001", name="Item", unit_price_minor=10000, quantity=1, available_stock=5)
    add_item(cart, sku="SKU-001", name="Item", unit_price_minor=10000, quantity=2, available_stock=5)

    assert len(cart.items) == 1
    assert cart.items[0].quantity == 3


def test_merge_respects_stock_limit():
    cart = Cart(currency="THB")

    add_item(cart, sku="SKU-001", name="Item", unit_price_minor=10000, quantity=3, available_stock=5)
    with pytest.raises(InsufficientStockError):
        add_item(cart, sku="SKU-001", name="Item", unit_price_minor=10000, quantity=3, available_stock=5)

    assert cart.items[0].quantity == 3


def test_save_for_later_moves_item():
    cart = Cart(currency="THB")

    add_item(cart, sku="SKU-005", name="Saved", unit_price_minor=5000, quantity=1, available_stock=5)
    save_for_later(cart, sku="SKU-005")

    assert len(cart.items) == 0
    assert len(cart.saved_items) == 1
    assert cart.saved_items[0].sku == "SKU-005"
