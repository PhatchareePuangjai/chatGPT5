from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.schemas.inventory import (
    CancelRequest,
    CancelResponse,
    PurchaseRequest,
    PurchaseResponse,
)
from src.api.schemas.response import ResponseEnvelope
from src.db.session import get_session
from src.services import inventory_service

router = APIRouter()


@router.post("/purchase", response_model=ResponseEnvelope[PurchaseResponse])
def purchase(req: PurchaseRequest, session: Session = Depends(get_session)):
    result = inventory_service.purchase(session, req.product_id, req.sku, req.quantity)
    return ResponseEnvelope(status="success", data=PurchaseResponse(**result), error=None)


@router.post("/cancel", response_model=ResponseEnvelope[CancelResponse])
def cancel(req: CancelRequest, session: Session = Depends(get_session)):
    result = inventory_service.restore(
        session, req.product_id, req.sku, req.quantity, req.reason
    )
    return ResponseEnvelope(status="success", data=CancelResponse(**result), error=None)
