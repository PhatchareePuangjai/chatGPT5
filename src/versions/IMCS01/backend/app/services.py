from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import desc, select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session

from .models import Alert, InventoryLog, Product


class NotFoundError(Exception):
    pass


class ConflictError(Exception):
    pass


class ValidationError(Exception):
    pass


@dataclass(frozen=True)
class StockChangeResult:
    product: Product
    log: InventoryLog
    low_stock_alert: Alert | None


def create_product(db: Session, *, sku: str, name: str, quantity: int, low_stock_threshold: int) -> Product:
    if quantity < 0:
        raise ValidationError("quantity must be >= 0")
    if low_stock_threshold < 0:
        raise ValidationError("low_stock_threshold must be >= 0")

    product = Product(
        sku=sku,
        name=name,
        quantity=quantity,
        low_stock_threshold=low_stock_threshold,
    )
    db.add(product)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise ConflictError("SKU already exists") from e
    db.refresh(product)
    return product


def list_products(db: Session) -> list[Product]:
    return list(db.execute(select(Product).order_by(Product.sku)).scalars().all())


def get_product_for_update(db: Session, *, sku: str) -> Product:
    stmt = select(Product).where(Product.sku == sku).with_for_update()
    try:
        return db.execute(stmt).scalars().one()
    except NoResultFound as e:
        raise NotFoundError(f"SKU not found: {sku}") from e


def purchase(db: Session, *, sku: str, quantity: int) -> StockChangeResult:
    if quantity <= 0:
        raise ValidationError("quantity must be > 0")

    # Atomic transaction + row locking prevents overselling under concurrency.
    with db.begin():
        product = get_product_for_update(db, sku=sku)

        if product.quantity < quantity:
            raise ValidationError("Insufficient stock")

        product.quantity -= quantity
        log = InventoryLog(product_id=product.id, type="SALE", delta=-quantity)
        db.add(log)

        alert: Alert | None = None
        if product.quantity <= product.low_stock_threshold:
            message = (
                f"Low stock: {product.sku} remaining {product.quantity} "
                f"(threshold {product.low_stock_threshold})"
            )
            alert = Alert(product_id=product.id, kind="LOW_STOCK", message=message)
            db.add(alert)

    db.refresh(product)
    db.refresh(log)
    if alert is not None:
        db.refresh(alert)
    return StockChangeResult(product=product, log=log, low_stock_alert=alert)


def restore(db: Session, *, sku: str, quantity: int) -> StockChangeResult:
    if quantity <= 0:
        raise ValidationError("quantity must be > 0")

    with db.begin():
        product = get_product_for_update(db, sku=sku)
        product.quantity += quantity
        log = InventoryLog(product_id=product.id, type="RESTOCK/RETURN", delta=quantity)
        db.add(log)

    db.refresh(product)
    db.refresh(log)
    return StockChangeResult(product=product, log=log, low_stock_alert=None)


def list_logs(db: Session, *, sku: str | None = None, limit: int = 200) -> list[InventoryLog]:
    stmt = select(InventoryLog).order_by(desc(InventoryLog.id)).limit(limit)
    if sku is not None:
        stmt = (
            select(InventoryLog)
            .join(Product, Product.id == InventoryLog.product_id)
            .where(Product.sku == sku)
            .order_by(desc(InventoryLog.id))
            .limit(limit)
        )
    return list(db.execute(stmt).scalars().all())


def list_alerts(db: Session, *, resolved: bool | None = None, limit: int = 200) -> list[Alert]:
    stmt = select(Alert).order_by(desc(Alert.id)).limit(limit)
    if resolved is not None:
        stmt = select(Alert).where(Alert.resolved == resolved).order_by(desc(Alert.id)).limit(limit)
    return list(db.execute(stmt).scalars().all())

