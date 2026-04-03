from uuid import uuid4

from sqlalchemy import select

from src.models.alert import Alert
from src.models.product import Product


def test_low_stock_alert_created_on_purchase(client, db_session):
    product_id = str(uuid4())
    db_session.add(
        Product(
            id=product_id,
            sku="SKU-002",
            available_qty=6,
            low_stock_threshold=5,
        )
    )
    db_session.commit()

    payload = {
        "order_id": str(uuid4()),
        "product_id": product_id,
        "sku": "SKU-002",
        "quantity": 2,
    }
    resp = client.post("/inventory/purchase", json=payload)

    assert resp.status_code == 200
    alerts = db_session.execute(select(Alert)).scalars().all()
    assert len(alerts) == 1
    assert alerts[0].stock_level == 4
