import pathlib
import sys
import os
import tempfile
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

BACKEND_ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from src.api.app import app
from src.db.base import Base
from src.db.session import get_session


def _make_engine(tmp_path: str):
    url = f"sqlite+pysqlite:///{tmp_path}"
    return create_engine(
        url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    fd, path = tempfile.mkstemp(prefix="inventory_test_", suffix=".db")
    os.close(fd)
    engine = _make_engine(path)
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()
        if os.path.exists(path):
            os.remove(path)


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def _get_session_override():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_session] = _get_session_override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
