from typing import Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ResponseEnvelope(BaseModel, Generic[T]):
    status: str
    data: Optional[T]
    error: Optional[str]
