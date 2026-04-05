from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class ProductIn(BaseModel):
    sku: str
    name: str
    unit_price_minor: int
    stock: int


class ProductOut(ProductIn):
    pass


class CartItemIn(BaseModel):
    sku: str
    quantity: int
    name: str | None = None
    unit_price_minor: int | None = None
    stock: int | None = None


class UpdateQuantityIn(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    sku: str
    name: str
    unit_price_minor: int
    quantity: int
    line_total_minor: int


class SavedItemOut(BaseModel):
    sku: str
    name: str
    unit_price_minor: int
    saved_at: datetime


class CartTotalsOut(BaseModel):
    subtotal_minor: int
    subtotal: str
    currency: str


class CartOut(BaseModel):
    items: list[CartItemOut]
    saved_items: list[SavedItemOut]
    totals: CartTotalsOut
