from src.lib.money import Money
from src.models.cart import Cart
from src.services.cart_service import CartService
from src.services.inventory_service import InventorySnapshot


def test_add_same_sku_merges_quantity():
    """Adding the same SKU twice merges into one CartItem with summed quantity."""
    service = CartService(InventorySnapshot(stock_by_sku={"SKU-001": 10}))
    cart = Cart.empty()

    result = service.add_item(cart, "SKU-001", Money.from_amount("100.00"), 2)
    result = service.add_item(result.cart, "SKU-001", Money.from_amount("100.00"), 3)

    assert result.error is None
    active = result.cart.active_items()
    assert len(active) == 1
    assert active[0].quantity == 5
    assert result.cart.total().cents == 50000
