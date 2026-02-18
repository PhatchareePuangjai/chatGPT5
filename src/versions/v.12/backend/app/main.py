from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .database import engine, get_db, Base
from .models import Product
from .schemas import (
    ProductResponse,
    OrderRequest,
    OrderResponse,
    RestoreRequest,
    InventoryLogResponse,
    AlertResponse,
)
from .services import (
    get_products,
    get_product_by_sku,
    deduct_stock,
    restore_stock,
    get_logs,
    get_alerts,
)
from sqlalchemy.orm import Session


from sqlalchemy import select


def seed_data(db: Session):
    if db.execute(select(Product).limit(1)).scalar_one_or_none() is None:
        for p in [
            Product(sku="SKU-001", name="Product 001", quantity=10, low_stock_threshold=5),
            Product(sku="SKU-002", name="Product 002", quantity=6, low_stock_threshold=5),
            Product(sku="SKU-003", name="Product 003", quantity=5, low_stock_threshold=5),
        ]:
            db.add(p)
        db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Inventory API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/products", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return get_products(db)


@app.get("/api/products/{sku}", response_model=ProductResponse)
def get_product(sku: str, db: Session = Depends(get_db)):
    p = get_product_by_sku(db, sku)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@app.post("/api/order", response_model=OrderResponse)
def place_order(req: OrderRequest, db: Session = Depends(get_db)):
    success, message, remaining = deduct_stock(db, req.sku, req.quantity)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return OrderResponse(success=True, message=message, remaining_stock=remaining)


@app.post("/api/restore", response_model=OrderResponse)
def restore(req: RestoreRequest, db: Session = Depends(get_db)):
    success, message, remaining = restore_stock(db, req.sku, req.quantity)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return OrderResponse(success=True, message=message, remaining_stock=remaining)


@app.get("/api/logs", response_model=list[InventoryLogResponse])
def list_logs(sku: str | None = None, limit: int = 100, db: Session = Depends(get_db)):
    return get_logs(db, sku=sku, limit=limit)


@app.get("/api/alerts", response_model=list[AlertResponse])
def list_alerts(limit: int = 50, db: Session = Depends(get_db)):
    return get_alerts(db, limit=limit)


# Serve frontend static files if present (for Docker single-container)
static_dir = Path(__file__).resolve().parent.parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
