from uuid import uuid4

from sqlalchemy import select

from src.models.inventory_log import InventoryLog
from src.models.product import Product
from src.services.inventory_service import restore


def test_restore_creates_log_and_updates_stock(db_session):
    product_id = str(uuid4())
    db_session.add(
        Product(
            id=product_id,
            sku="SKU-003",
            available_qty=5,
            low_stock_threshold=1,
        )
    )
    db_session.commit()

    result = restore(db_session, product_id, "SKU-003", 1, "cancelled")

    assert result["remaining"] == 6
    log = db_session.execute(select(InventoryLog)).scalar_one()
    assert log.operation == "RESTOCK"
    assert log.quantity_delta == 1
