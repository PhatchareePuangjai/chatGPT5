import os
import tempfile
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from uuid import uuid4

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from src.models.product import Product
from src.services.inventory_service import purchase
from src.db.base import Base
from src.api.errors import InsufficientStockError


def test_concurrent_purchases_only_one_succeeds():
    fd, db_path = tempfile.mkstemp(prefix="concurrency_test_", suffix=".db")
    os.close(fd)
    engine = create_engine(
        f"sqlite+pysqlite:///{db_path}",
        connect_args={"check_same_thread": False, "timeout": 30},
        poolclass=NullPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    product_id = str(uuid4())
    with SessionLocal() as session:
        session.add(
            Product(
                id=product_id,
                sku="SKU-EDGE",
                available_qty=1,
                low_stock_threshold=0,
            )
        )
        session.commit()

    barrier = Barrier(5)

    def worker():
        try:
            barrier.wait()
            with SessionLocal() as session:
                purchase(session, product_id, "SKU-EDGE", 1)
            return True
        except InsufficientStockError:
            return False

    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(lambda _: worker(), range(5)))

    assert results.count(True) == 1
    assert results.count(False) == 4

    with SessionLocal() as session:
        product = session.execute(select(Product)).scalar_one()
        assert product.available_qty == 0

    engine.dispose()
    if os.path.exists(db_path):
        os.remove(db_path)
