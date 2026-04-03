from uuid import uuid4

from src.models.product import Product


def test_purchase_contract_success(client, db_session):
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

    payload = {
        "order_id": str(uuid4()),
        "product_id": product_id,
        "sku": "SKU-001",
        "quantity": 2,
    }
    resp = client.post("/inventory/purchase", json=payload)

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "success"
    assert body["error"] is None
    assert body["data"]["deducted"] == 2
    assert body["data"]["remaining"] == 8
