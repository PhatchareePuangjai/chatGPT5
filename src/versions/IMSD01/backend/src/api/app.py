from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from src.api.errors import ConcurrencyError, InsufficientStockError, ValidationError
from src.api.router import router
from src.api.schemas.response import ResponseEnvelope
from src.config.logging import setup_logging


app = FastAPI(title="Inventory Management")
setup_logging()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(InsufficientStockError)
async def handle_insufficient_stock(_request, exc: InsufficientStockError):
    return JSONResponse(
        status_code=400,
        content=ResponseEnvelope(status="error", data=None, error=str(exc)).model_dump(),
    )


@app.exception_handler(ValidationError)
async def handle_validation_error(_request, exc: ValidationError):
    return JSONResponse(
        status_code=400,
        content=ResponseEnvelope(status="error", data=None, error=str(exc)).model_dump(),
    )


@app.exception_handler(ConcurrencyError)
async def handle_concurrency_error(_request, exc: ConcurrencyError):
    return JSONResponse(
        status_code=409,
        content=ResponseEnvelope(status="error", data=None, error=str(exc)).model_dump(),
    )


app.include_router(router)
