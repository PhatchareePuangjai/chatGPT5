from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ProductOut(BaseModel):
    sku: str
    name: str
    price_cents: int
    stock_qty: int


class CartItemOut(BaseModel):
    id: int
    status: Literal["ACTIVE", "SAVED"]
    sku: str
    name: str
    price_cents: int
    quantity: int
    line_total_cents: int


class CartOut(BaseModel):
    id: str
    active_items: list[CartItemOut]
    saved_items: list[CartItemOut]
    grand_total_cents: int


class AddItemIn(BaseModel):
    sku: str
    quantity: int = Field(ge=1)


class UpdateQuantityIn(BaseModel):
    quantity: int = Field(ge=1)

