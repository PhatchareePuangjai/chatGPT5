from typing import Optional
from pydantic import BaseModel, Field


class PurchaseRequest(BaseModel):
    order_id: str
    product_id: str
    sku: str
    quantity: int = Field(gt=0)


class PurchaseResponse(BaseModel):
    product_id: str
    sku: str
    deducted: int
    remaining: int
    log_id: str
    alert_id: Optional[str]


class CancelRequest(BaseModel):
    order_id: str
    product_id: str
    sku: str
    quantity: int = Field(gt=0)
    reason: str


class CancelResponse(BaseModel):
    product_id: str
    sku: str
    restored: int
    remaining: int
    log_id: str
