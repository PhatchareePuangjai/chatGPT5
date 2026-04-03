from uuid import uuid4

from src.models.product import Product


def test_cancel_contract_success(client, db_session):
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
        "reason": "cancelled",
    }
    resp = client.post("/inventory/cancel", json=payload)

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "success"
    assert body["data"]["restored"] == 1
    assert body["data"]["remaining"] == 6
