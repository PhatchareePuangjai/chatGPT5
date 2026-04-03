from uuid import uuid4

from sqlalchemy.orm import Session

from src.models.alert import Alert


def create_low_stock_alert(session: Session, product_id: str, stock_level: int) -> Alert:
    alert = Alert(
        id=str(uuid4()),
        product_id=product_id,
        trigger_type="LOW_STOCK",
        stock_level=stock_level,
    )
    session.add(alert)
    return alert
