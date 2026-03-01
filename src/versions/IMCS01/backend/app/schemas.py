from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=255)
    quantity: int = Field(ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    low_stock_threshold: int | None = Field(default=None, ge=0)


class ProductOut(BaseModel):
    id: int
    sku: str
    name: str
    quantity: int
    low_stock_threshold: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StockChangeRequest(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    quantity: int = Field(gt=0)


class InventoryLogOut(BaseModel):
    id: int
    product_id: int
    type: str
    delta: int
    note: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    product_id: int
    kind: str
    message: str
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

