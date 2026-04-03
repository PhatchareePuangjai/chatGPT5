from fastapi import APIRouter

from src.api.routes import inventory

router = APIRouter()
router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
