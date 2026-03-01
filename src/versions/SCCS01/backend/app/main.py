from __future__ import annotations

import time

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, selectinload

from .db import Base, SessionLocal, engine, get_db
from .logic import cart_to_out
from .models import Cart, CartItem, CartItemStatus, Product
from .schemas import AddItemIn, CartOut, ProductOut, UpdateQuantityIn
from .seed import seed_products
from .settings import settings

app = FastAPI(title="Shopping Cart API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/products", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    products = db.execute(select(Product).order_by(Product.sku.asc())).scalars().all()
    return [
        ProductOut(
            sku=p.sku,
            name=p.name,
            price_cents=p.price_cents,
            stock_qty=p.stock_qty,
        )
        for p in products
    ]


def _get_cart_or_404(db: Session, cart_id: str) -> Cart:
    cart = (
        db.execute(
            select(Cart)
            .where(Cart.id == cart_id)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
        )
        .scalars()
        .first()
    )
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart


def _insufficient_stock_error():
    raise HTTPException(status_code=409, detail="สินค้าไม่เพียงพอ")


@app.post("/api/carts", response_model=CartOut)
def create_cart(db: Session = Depends(get_db)):
    cart = Cart()
    db.add(cart)
    db.commit()
    db.refresh(cart)
    cart = _get_cart_or_404(db, cart.id)
    return cart_to_out(cart)


@app.get("/api/carts/{cart_id}", response_model=CartOut)
def get_cart(cart_id: str, db: Session = Depends(get_db)):
    cart = _get_cart_or_404(db, cart_id)
    return cart_to_out(cart)


@app.post("/api/carts/{cart_id}/items", response_model=CartOut)
def add_item(cart_id: str, body: AddItemIn, db: Session = Depends(get_db)):
    cart = _get_cart_or_404(db, cart_id)

    product = db.execute(select(Product).where(Product.sku == body.sku)).scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing_active = next(
        (i for i in cart.items if i.product_id == product.id and i.status == CartItemStatus.ACTIVE),
        None,
    )
    new_qty = body.quantity + (existing_active.quantity if existing_active else 0)
    if new_qty > product.stock_qty:
        _insufficient_stock_error()

    if existing_active:
        existing_active.quantity = new_qty
    else:
        db.add(
            CartItem(
                cart_id=cart.id,
                product_id=product.id,
                status=CartItemStatus.ACTIVE,
                quantity=body.quantity,
            )
        )

    db.commit()
    cart = _get_cart_or_404(db, cart_id)
    return cart_to_out(cart)


@app.patch("/api/carts/{cart_id}/items/{item_id}", response_model=CartOut)
def update_item_quantity(cart_id: str, item_id: int, body: UpdateQuantityIn, db: Session = Depends(get_db)):
    cart = _get_cart_or_404(db, cart_id)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.status == CartItemStatus.ACTIVE and body.quantity > item.product.stock_qty:
        _insufficient_stock_error()

    item.quantity = body.quantity
    db.commit()
    cart = _get_cart_or_404(db, cart_id)
    return cart_to_out(cart)


@app.post("/api/carts/{cart_id}/items/{item_id}/save", response_model=CartOut)
def save_for_later(cart_id: str, item_id: int, db: Session = Depends(get_db)):
    cart = _get_cart_or_404(db, cart_id)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.status = CartItemStatus.SAVED
    db.commit()
    cart = _get_cart_or_404(db, cart_id)
    return cart_to_out(cart)


@app.post("/api/carts/{cart_id}/items/{item_id}/activate", response_model=CartOut)
def activate_saved_item(cart_id: str, item_id: int, db: Session = Depends(get_db)):
    cart = _get_cart_or_404(db, cart_id)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.status != CartItemStatus.SAVED:
        raise HTTPException(status_code=409, detail="Item is not saved")

    if item.quantity > item.product.stock_qty:
        _insufficient_stock_error()

    existing_active = next(
        (i for i in cart.items if i.product_id == item.product_id and i.status == CartItemStatus.ACTIVE),
        None,
    )
    if existing_active:
        merged_qty = existing_active.quantity + item.quantity
        if merged_qty > item.product.stock_qty:
            _insufficient_stock_error()
        existing_active.quantity = merged_qty
        db.delete(item)
    else:
        item.status = CartItemStatus.ACTIVE

    db.commit()
    cart = _get_cart_or_404(db, cart_id)
    return cart_to_out(cart)


@app.delete("/api/carts/{cart_id}/items/{item_id}", response_model=CartOut)
def delete_item(cart_id: str, item_id: int, db: Session = Depends(get_db)):
    cart = _get_cart_or_404(db, cart_id)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    cart = _get_cart_or_404(db, cart_id)
    return cart_to_out(cart)

