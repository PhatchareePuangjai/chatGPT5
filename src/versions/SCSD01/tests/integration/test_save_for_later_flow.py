from src.lib.money import Money
from src.models.cart import Cart
from src.services.cart_service import CartService
from src.services.inventory_service import InventorySnapshot


def test_saved_item_excluded_from_total():
    """A saved item is removed from active_items and excluded from cart total."""
    service = CartService(InventorySnapshot(stock_by_sku={"SKU-A": 5, "SKU-B": 5}))
    cart = Cart.empty()

    result = service.add_item(cart, "SKU-A", Money.from_amount("200.00"), 1)
    result = service.add_item(result.cart, "SKU-B", Money.from_amount("300.00"), 1)
    result = service.save_for_later(result.cart, "SKU-A")

    assert result.error is None
    summary = service.summary(result.cart)
    assert len(summary["active_items"]) == 1
    assert summary["active_items"][0].sku == "SKU-B"
    assert len(summary["saved_items"]) == 1
    assert summary["saved_items"][0].sku == "SKU-A"
    assert summary["total"].cents == 30000
