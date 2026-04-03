from uuid import uuid4

from sqlalchemy import select

from src.models.inventory_log import InventoryLog
from src.models.product import Product
from src.services.inventory_service import purchase


def test_purchase_creates_log_and_updates_stock(db_session):
    product_id = str(uuid4())
    db_session.add(
        Product(
            id=product_id,
            sku="SKU-001",
            available_qty=10,
            low_stock_threshold=5,
        )
    )
    db_session.commit()

    result = purchase(db_session, product_id, "SKU-001", 2)

    assert result["remaining"] == 8
    log = db_session.execute(select(InventoryLog)).scalar_one()
    assert log.operation == "SALE"
    assert log.quantity_delta == -2
