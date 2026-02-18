from pydantic import BaseModel
from datetime import datetime


class ProductBase(BaseModel):
    sku: str
    name: str
    quantity: int = 0
    low_stock_threshold: int = 5


class ProductResponse(ProductBase):
    id: int
    created_at: datetime | None

    class Config:
        from_attributes = True


class OrderRequest(BaseModel):
    sku: str
    quantity: int


class OrderResponse(BaseModel):
    success: bool
    message: str
    remaining_stock: int | None = None


class RestoreRequest(BaseModel):
    sku: str
    quantity: int


class InventoryLogResponse(BaseModel):
    id: int
    product_id: int
    log_type: str
    quantity_delta: int
    created_at: datetime

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: int
    product_id: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
