from uuid import uuid4

import pytest
from sqlalchemy import select

from src.models.inventory_log import InventoryLog
from src.models.product import Product
from src.services.inventory_service import purchase


def test_purchase_rolls_back_on_log_failure(db_session, monkeypatch):
    product_id = str(uuid4())
    db_session.add(
        Product(
            id=product_id,
            sku="SKU-001",
            available_qty=5,
            low_stock_threshold=1,
        )
    )
    db_session.commit()

    original_add = db_session.add

    def add_with_failure(instance):
        if isinstance(instance, InventoryLog):
            raise RuntimeError("log insert failed")
        return original_add(instance)

    monkeypatch.setattr(db_session, "add", add_with_failure)

    with pytest.raises(RuntimeError):
        purchase(db_session, product_id, "SKU-001", 2)

    product = db_session.execute(select(Product)).scalar_one()
    assert product.available_qty == 5
    logs = db_session.execute(select(InventoryLog)).scalars().all()
    assert logs == []
