from uuid import uuid4

import pytest

from src.api.errors import InsufficientStockError
from src.models.product import Product
from src.services.inventory_service import purchase


def test_insufficient_stock_rejected(db_session):
    product_id = str(uuid4())
    db_session.add(
        Product(
            id=product_id,
            sku="SKU-BOUNDARY",
            available_qty=5,
            low_stock_threshold=1,
        )
    )
    db_session.commit()

    with pytest.raises(InsufficientStockError):
        purchase(db_session, product_id, "SKU-BOUNDARY", 6)
