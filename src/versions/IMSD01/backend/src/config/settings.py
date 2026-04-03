from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@db:5432/inventory",
    )
    env: str = os.getenv("APP_ENV", "local")


settings = Settings()
