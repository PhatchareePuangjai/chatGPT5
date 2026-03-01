from __future__ import annotations

import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .schemas import (
    AlertOut,
    InventoryLogOut,
    ProductCreate,
    ProductOut,
    StockChangeRequest,
)
from .services import (
    ConflictError,
    NotFoundError,
    ValidationError,
    create_product,
    list_alerts,
    list_logs,
    list_products,
    purchase,
    restore,
)


app = FastAPI(title="Inventory Management API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/products", response_model=ProductOut)
def api_create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    try:
        return create_product(
            db,
            sku=payload.sku,
            name=payload.name,
            quantity=payload.quantity,
            low_stock_threshold=payload.low_stock_threshold,
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except ConflictError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e


@app.get("/api/products", response_model=list[ProductOut])
def api_list_products(db: Session = Depends(get_db)):
    return list_products(db)


@app.post("/api/purchase", response_model=ProductOut)
def api_purchase(payload: StockChangeRequest, db: Session = Depends(get_db)):
    try:
        result = purchase(db, sku=payload.sku, quantity=payload.quantity)
        return result.product
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@app.post("/api/restore", response_model=ProductOut)
def api_restore(payload: StockChangeRequest, db: Session = Depends(get_db)):
    try:
        result = restore(db, sku=payload.sku, quantity=payload.quantity)
        return result.product
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@app.get("/api/logs", response_model=list[InventoryLogOut])
def api_logs(sku: str | None = None, limit: int = 200, db: Session = Depends(get_db)):
    return list_logs(db, sku=sku, limit=limit)


@app.get("/api/alerts", response_model=list[AlertOut])
def api_alerts(resolved: bool | None = None, limit: int = 200, db: Session = Depends(get_db)):
    return list_alerts(db, resolved=resolved, limit=limit)

