import pytest

from src.lib.money import Money
from src.models.cart_item import CartItem


def _item(sku: str = "SKU-001", price: str = "100.00", qty: int = 1) -> CartItem:
    return CartItem(sku=sku, unit_price=Money.from_amount(price), quantity=qty)


def test_with_quantity_updates_correctly():
    """with_quantity returns a new CartItem with the given quantity."""
    updated = _item(qty=1).with_quantity(5)
    assert updated.quantity == 5
    assert updated.line_total.cents == 50000


def test_save_for_later_changes_status():
    """save_for_later changes status to SAVED without mutating the original."""
    original = _item()
    saved = original.save_for_later()
    assert saved.status == "SAVED"
    assert original.status == "ACTIVE"


def test_with_quantity_raises_on_zero():
    """with_quantity raises ValueError when quantity is zero or negative."""
    with pytest.raises(ValueError):
        _item().with_quantity(0)
