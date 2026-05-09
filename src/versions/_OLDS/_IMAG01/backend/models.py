from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from versions.olds._IMAG01.backend.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)
    stock = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=5)

class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, index=True)
    type = Column(String)  # "SALE" or "RESTOCK/RETURN"
    quantity_change = Column(Integer)  # e.g., -2 or +1
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
