from __future__ import annotations

import os
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Shopping Cart API")


class HealthResponse(BaseModel):
    status: str
    database: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    db_url = os.getenv("DATABASE_URL", "")
    return HealthResponse(status="ok", database="configured" if db_url else "missing")
