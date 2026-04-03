from contextlib import contextmanager
from uuid import uuid4

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from src.api.errors import InsufficientStockError, ValidationError
from src.models.inventory_log import InventoryLog
from src.models.product import Product
from src.services.alert_service import create_low_stock_alert


@contextmanager
def _transaction(session: Session):
    if session.in_transaction():
        with session.begin_nested():
            yield
    else:
        with session.begin():
            yield


def purchase(session: Session, product_id: str, sku: str, quantity: int):
    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero")

    with _transaction(session):
        product = session.execute(
            select(Product).where(Product.id == product_id, Product.sku == sku)
        ).scalar_one_or_none()
        if product is None:
            raise ValidationError("Product not found")

        result = session.execute(
            update(Product)
            .where(
                Product.id == product_id,
                Product.sku == sku,
                Product.available_qty >= quantity,
            )
            .values(available_qty=Product.available_qty - quantity)
        )
        if result.rowcount != 1:
            raise InsufficientStockError(quantity, product.available_qty)

        session.flush()
        product = session.execute(
            select(Product).where(Product.id == product_id, Product.sku == sku)
        ).scalar_one()

        log = InventoryLog(
            id=str(uuid4()),
            product_id=product.id,
            operation="SALE",
            quantity_delta=-quantity,
        )
        session.add(log)

        alert_id = None
        if product.available_qty <= product.low_stock_threshold:
            alert = create_low_stock_alert(session, product.id, product.available_qty)
            alert_id = alert.id

        return {
            "product_id": product.id,
            "sku": product.sku,
            "deducted": quantity,
            "remaining": product.available_qty,
            "log_id": log.id,
            "alert_id": alert_id,
        }


def restore(session: Session, product_id: str, sku: str, quantity: int, reason: str):
    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero")

    if reason not in {"cancelled", "expired"}:
        raise ValidationError("Order not cancellable")

    operation = "RESTOCK" if reason == "cancelled" else "RETURN"

    with _transaction(session):
        stmt = (
            select(Product)
            .where(Product.id == product_id, Product.sku == sku)
            .with_for_update()
        )
        product = session.execute(stmt).scalar_one_or_none()
        if product is None:
            raise ValidationError("Product not found")

        product.available_qty += quantity

        log = InventoryLog(
            id=str(uuid4()),
            product_id=product.id,
            operation=operation,
            quantity_delta=quantity,
        )
        session.add(log)

        return {
            "product_id": product.id,
            "sku": product.sku,
            "restored": quantity,
            "remaining": product.available_qty,
            "log_id": log.id,
        }
