from src.services.inventory_service import InventorySnapshot


def test_can_add_within_stock():
    """can_add returns True when current_qty + requested_qty <= available."""
    snapshot = InventorySnapshot(stock_by_sku={"SKU-001": 5})
    assert snapshot.can_add("SKU-001", 2, 3) is True


def test_cannot_add_exceeds_stock():
    """can_add returns False when cumulative quantity exceeds available stock."""
    snapshot = InventorySnapshot(stock_by_sku={"SKU-001": 5})
    assert snapshot.can_add("SKU-001", 3, 3) is False


def test_unknown_sku_returns_zero_stock():
    """available returns 0 for an SKU not in the snapshot."""
    snapshot = InventorySnapshot(stock_by_sku={})
    assert snapshot.available("UNKNOWN") == 0
    assert snapshot.can_add("UNKNOWN", 0, 1) is False
