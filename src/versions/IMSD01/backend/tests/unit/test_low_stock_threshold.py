from uuid import uuid4

from sqlalchemy import select

from src.models.alert import Alert
from src.models.product import Product
from src.services.inventory_service import purchase


def test_low_stock_threshold_boundary(db_session):
    product_id = str(uuid4())
    db_session.add(
        Product(
            id=product_id,
            sku="SKU-LOW",
            available_qty=6,
            low_stock_threshold=5,
        )
    )
    db_session.commit()

    purchase(db_session, product_id, "SKU-LOW", 1)  # remaining 5
    alerts = db_session.execute(select(Alert)).scalars().all()
    assert len(alerts) == 1
    assert alerts[0].stock_level == 5

    purchase(db_session, product_id, "SKU-LOW", 1)  # remaining 4
    alerts = db_session.execute(select(Alert)).scalars().all()
    assert len(alerts) == 2
    assert alerts[-1].stock_level == 4
