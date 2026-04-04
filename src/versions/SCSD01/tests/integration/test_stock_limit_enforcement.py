from src.lib.money import Money
from src.models.cart import Cart
from src.services.cart_service import CartService, STOCK_EXCEEDED_MESSAGE
from src.services.inventory_service import InventorySnapshot


def test_add_blocked_when_cumulative_exceeds_stock():
    """CartService blocks additions when cart qty + requested qty exceeds available stock."""
    service = CartService(InventorySnapshot(stock_by_sku={"SKU-005": 5}))
    cart = Cart.empty()

    result = service.add_item(cart, "SKU-005", Money.from_amount("50.00"), 3)
    assert result.error is None

    blocked = service.add_item(result.cart, "SKU-005", Money.from_amount("50.00"), 3)
    assert blocked.error == STOCK_EXCEEDED_MESSAGE
    assert blocked.cart.active_items()[0].quantity == 3
