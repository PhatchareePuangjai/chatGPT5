from uuid import uuid4

from sqlalchemy import select

from src.models.inventory_log import InventoryLog
from src.models.product import Product


def test_restore_stock_flow(client, db_session):
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

    payload = {
        "order_id": str(uuid4()),
        "product_id": product_id,
        "sku": "SKU-003",
        "quantity": 1,
        "reason": "expired",
    }
    resp = client.post("/inventory/cancel", json=payload)

    assert resp.status_code == 200
    logs = db_session.execute(select(InventoryLog)).scalars().all()
    assert len(logs) == 1
    assert logs[0].operation == "RETURN"
