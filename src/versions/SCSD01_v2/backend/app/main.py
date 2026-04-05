from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Cart, CartItem, Product, SavedItem
from .schemas import (
    CartItemIn,
    CartOut,
    CartTotalsOut,
    CartItemOut,
    ProductIn,
    ProductOut,
    SavedItemOut,
    UpdateQuantityIn,
)

app = FastAPI(title="Shopping Cart API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def format_minor(amount_minor: int) -> str:
    return f"{amount_minor / 100:.2f}"


def ensure_cart(db: Session) -> Cart:
    cart = db.scalar(select(Cart).limit(1))
    if cart is None:
        cart = Cart(currency="THB")
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        ensure_cart(db)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/products", response_model=ProductOut)
def upsert_product(payload: ProductIn, db: Session = Depends(get_db)) -> ProductOut:
    product = db.get(Product, payload.sku)
    if product is None:
        product = Product(
            sku=payload.sku,
            name=payload.name,
            unit_price_minor=payload.unit_price_minor,
            stock=payload.stock,
        )
        db.add(product)
    else:
        product.name = payload.name
        product.unit_price_minor = payload.unit_price_minor
        product.stock = payload.stock
    db.commit()
    db.refresh(product)
    return ProductOut(
        sku=product.sku,
        name=product.name,
        unit_price_minor=product.unit_price_minor,
        stock=product.stock,
    )


@app.get("/products", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)) -> list[ProductOut]:
    products = db.scalars(select(Product)).all()
    return [
        ProductOut(
            sku=product.sku,
            name=product.name,
            unit_price_minor=product.unit_price_minor,
            stock=product.stock,
        )
        for product in products
    ]


@app.post("/cart/items", response_model=CartOut)
def add_cart_item(payload: CartItemIn, db: Session = Depends(get_db)) -> CartOut:
    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="quantity must be positive")

    cart = ensure_cart(db)

    product = db.get(Product, payload.sku)
    if product is None:
        if payload.name is None or payload.unit_price_minor is None or payload.stock is None:
            raise HTTPException(status_code=404, detail="product not found")
        product = Product(
            sku=payload.sku,
            name=payload.name,
            unit_price_minor=payload.unit_price_minor,
            stock=payload.stock,
        )
        db.add(product)
        db.flush()

    existing = db.scalar(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.sku == payload.sku)
    )
    current_qty = existing.quantity if existing else 0
    if current_qty + payload.quantity > product.stock:
        raise HTTPException(status_code=400, detail="insufficient stock")

    if existing:
        existing.quantity = current_qty + payload.quantity
    else:
        db.add(CartItem(cart_id=cart.id, sku=payload.sku, quantity=payload.quantity))

    db.commit()
    return build_cart_response(db, cart)


@app.put("/cart/items/{sku}", response_model=CartOut)
def update_quantity(sku: str, payload: UpdateQuantityIn, db: Session = Depends(get_db)) -> CartOut:
    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="quantity must be positive")

    cart = ensure_cart(db)
    item = db.scalar(select(CartItem).where(CartItem.cart_id == cart.id, CartItem.sku == sku))
    if item is None:
        raise HTTPException(status_code=404, detail="item not found")

    product = db.get(Product, sku)
    if product is None:
        raise HTTPException(status_code=404, detail="product not found")

    if payload.quantity > product.stock:
        raise HTTPException(status_code=400, detail="insufficient stock")

    item.quantity = payload.quantity
    db.commit()
    return build_cart_response(db, cart)


@app.post("/cart/items/{sku}/save", response_model=CartOut)
def save_for_later(sku: str, db: Session = Depends(get_db)) -> CartOut:
    cart = ensure_cart(db)
    item = db.scalar(select(CartItem).where(CartItem.cart_id == cart.id, CartItem.sku == sku))
    if item is None:
        raise HTTPException(status_code=404, detail="item not found")

    db.delete(item)
    db.add(SavedItem(cart_id=cart.id, sku=sku))
    db.commit()
    return build_cart_response(db, cart)


@app.get("/cart", response_model=CartOut)
def get_cart(db: Session = Depends(get_db)) -> CartOut:
    cart = ensure_cart(db)
    return build_cart_response(db, cart)


def build_cart_response(db: Session, cart: Cart) -> CartOut:
    items = db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    saved = db.scalars(select(SavedItem).where(SavedItem.cart_id == cart.id)).all()

    item_payloads: list[CartItemOut] = []
    subtotal_minor = 0

    for item in items:
        product = db.get(Product, item.sku)
        if product is None:
            continue
        line_total = product.unit_price_minor * item.quantity
        subtotal_minor += line_total
        item_payloads.append(
            CartItemOut(
                sku=item.sku,
                name=product.name,
                unit_price_minor=product.unit_price_minor,
                quantity=item.quantity,
                line_total_minor=line_total,
            )
        )

    saved_payloads = []
    for saved_item in saved:
        product = db.get(Product, saved_item.sku)
        if product is None:
            continue
        saved_payloads.append(
            SavedItemOut(
                sku=saved_item.sku,
                name=product.name,
                unit_price_minor=product.unit_price_minor,
                saved_at=saved_item.saved_at,
            )
        )

    totals = CartTotalsOut(
        subtotal_minor=subtotal_minor,
        subtotal=format_minor(subtotal_minor),
        currency=cart.currency,
    )

    return CartOut(items=item_payloads, saved_items=saved_payloads, totals=totals)
