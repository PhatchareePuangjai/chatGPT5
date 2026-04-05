import pytest

from cart.errors import InsufficientStockError
from cart.models import Cart
from cart.service import add_item, save_for_later, update_quantity
from cart.totals import calculate_cart_total


def test_update_quantity_recalculates_totals():
    cart = Cart(currency="THB")
    add_item(cart, sku="A", name="Item A", unit_price_minor=10000, quantity=1, available_stock=10)

    update_quantity(cart, sku="A", quantity=3, available_stock=10)

    assert cart.items[0].quantity == 3
    assert calculate_cart_total(cart) == 30000


def test_add_merge_workflow():
    cart = Cart(currency="THB")
    add_item(cart, sku="SKU-001", name="Item", unit_price_minor=10000, quantity=1, available_stock=5)
    add_item(cart, sku="SKU-001", name="Item", unit_price_minor=10000, quantity=2, available_stock=5)

    assert len(cart.items) == 1
    assert cart.items[0].quantity == 3


def test_save_for_later_workflow():
    cart = Cart(currency="THB")
    add_item(cart, sku="SKU-005", name="Saved", unit_price_minor=5000, quantity=1, available_stock=5)

    save_for_later(cart, sku="SKU-005")

    assert len(cart.items) == 0
    assert len(cart.saved_items) == 1
    assert calculate_cart_total(cart) == 0


def test_update_quantity_rejects_stock_overflow():
    cart = Cart(currency="THB")
    add_item(cart, sku="SKU-001", name="Item", unit_price_minor=10000, quantity=3, available_stock=5)

    with pytest.raises(InsufficientStockError):
        update_quantity(cart, sku="SKU-001", quantity=6, available_stock=5)

    assert cart.items[0].quantity == 3
