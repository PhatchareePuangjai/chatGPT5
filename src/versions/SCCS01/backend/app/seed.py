from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Product


def seed_products(db: Session) -> None:
    existing = db.execute(select(Product.id).limit(1)).first()
    if existing:
        return

    db.add_all(
        [
            Product(sku="SKU-001", name="Product A", price_cents=10000, stock_qty=10),
            Product(sku="SKU-005", name="Product E", price_cents=25000, stock_qty=5),
            Product(sku="SKU-01999", name="Product 19.99", price_cents=1999, stock_qty=20),
        ]
    )
    db.commit()

