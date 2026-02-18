from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .models import Product, InventoryLog, Alert


def get_products(db: Session):
    return db.execute(select(Product).order_by(Product.sku)).scalars().all()


def get_product_by_sku(db: Session, sku: str):
    return db.execute(select(Product).where(Product.sku == sku)).scalar_one_or_none()


def deduct_stock(db: Session, sku: str, quantity: int) -> tuple[bool, str, int | None]:
    """
    Deduct stock with row lock (SELECT FOR UPDATE). All-or-nothing with log.
    Returns (success, message, remaining_stock).
    """
    if quantity <= 0:
        return False, "Quantity must be positive", None

    # Lock row for update so concurrent requests are serialized (race condition)
    product = db.execute(
        select(Product).where(Product.sku == sku).with_for_update()
    ).scalar_one_or_none()

    if not product:
        return False, "Product not found", None

    if product.quantity < quantity:
        return False, "Insufficient Stock", product.quantity

    # Deduct
    product.quantity -= quantity

    # Log SALE (quantity_delta is negative)
    log = InventoryLog(
        product_id=product.id,
        log_type="SALE",
        quantity_delta=-quantity,
    )
    db.add(log)

    # Low stock check: alert when quantity <= threshold (boundary: 5 and 4 both alert)
    if product.quantity <= product.low_stock_threshold:
        alert = Alert(
            product_id=product.id,
            message=f"Low stock: {product.sku} has {product.quantity} items (threshold={product.low_stock_threshold})",
        )
        db.add(alert)

    db.commit()
    db.refresh(product)
    return True, "Success", product.quantity


def restore_stock(db: Session, sku: str, quantity: int) -> tuple[bool, str, int | None]:
    """Restore stock (e.g. order cancelled) and log RESTOCK."""
    if quantity <= 0:
        return False, "Quantity must be positive", None

    product = db.execute(select(Product).where(Product.sku == sku)).scalar_one_or_none()
    if not product:
        return False, "Product not found", None

    product.quantity += quantity
    log = InventoryLog(
        product_id=product.id,
        log_type="RESTOCK",
        quantity_delta=quantity,
    )
    db.add(log)
    db.commit()
    db.refresh(product)
    return True, "Success", product.quantity


def get_logs(db: Session, sku: str | None = None, limit: int = 100):
    q = select(InventoryLog).order_by(InventoryLog.created_at.desc()).limit(limit)
    if sku:
        q = q.join(Product).where(Product.sku == sku)
    return db.execute(q).scalars().all()


def get_alerts(db: Session, limit: int = 50):
    return (
        db.execute(select(Alert).order_by(Alert.created_at.desc()).limit(limit))
        .scalars()
        .all()
    )
