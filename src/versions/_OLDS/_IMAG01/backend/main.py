from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from versions.olds._IMAG01.backend.database import engine, Base, get_db
import versions.olds._IMAG01.backend.models as models
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Initialize the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management API")

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class BuyRequest(BaseModel):
    sku: str
    quantity: int

class CancelRequest(BaseModel):
    sku: str
    quantity: int

class ProductOut(BaseModel):
    sku: str
    name: str
    stock: int
    low_stock_threshold: int

    class Config:
        from_attributes = True

class InventoryLogOut(BaseModel):
    id: int
    sku: str
    type: str
    quantity_change: int
    timestamp: datetime

    class Config:
        from_attributes = True

@app.on_event("startup")
def seed_data():
    db = next(get_db())
    if not db.query(models.Product).first():
        products = [
            models.Product(sku="SKU-001", name="Product A", stock=10, low_stock_threshold=5),
            models.Product(sku="SKU-002", name="Product B", stock=6, low_stock_threshold=5),
            models.Product(sku="SKU-003", name="Product C", stock=5, low_stock_threshold=5),
        ]
        db.add_all(products)
        db.commit()

@app.post("/api/buy")
def buy_product(request: BuyRequest, db: Session = Depends(get_db)):
    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    try:
        # 1. Start Transaction and lock the row using with_for_update() to prevent race conditions
        stmt = select(models.Product).where(models.Product.sku == request.sku).with_for_update()
        product = db.execute(stmt).scalar_one_or_none()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # 2. Overselling Attempt Check
        if product.stock < request.quantity:
            raise HTTPException(status_code=400, detail="Insufficient Stock")

        # 3. Successful Stock Deduction
        product.stock -= request.quantity

        # 4. Create InventoryLog in the same transaction for Atomicity
        log = models.InventoryLog(
            sku=request.sku,
            type="SALE",
            quantity_change=-request.quantity
        )
        db.add(log)

        # 5. Low Stock Alert Trigger Check
        alert_triggered = False
        if product.stock <= product.low_stock_threshold:
            # Here we might send an event. For the API, we return the alert status.
            alert_triggered = True
            
        # Commit transaction explicitly
        db.commit()

        return {
            "status": "Success",
            "message": "Stock deducted successfully",
            "remaining_stock": product.stock,
            "alert_triggered": alert_triggered
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cancel")
def cancel_order(request: CancelRequest, db: Session = Depends(get_db)):
    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    try:
        # Lock the row for update
        stmt = select(models.Product).where(models.Product.sku == request.sku).with_for_update()
        product = db.execute(stmt).scalar_one_or_none()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Stock Restoration
        product.stock += request.quantity

        # Create InventoryLog
        log = models.InventoryLog(
            sku=request.sku,
            type="RESTOCK/RETURN",
            quantity_change=request.quantity
        )
        db.add(log)
        
        db.commit()

        return {
            "status": "Success",
            "message": "Stock restored successfully",
            "remaining_stock": product.stock
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).order_by(models.Product.id).all()
    return products

@app.get("/api/logs", response_model=List[InventoryLogOut])
def list_logs(db: Session = Depends(get_db)):
    logs = db.query(models.InventoryLog).order_by(models.InventoryLog.timestamp.desc()).limit(100).all()
    return logs
