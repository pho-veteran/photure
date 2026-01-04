from functools import lru_cache
from pydantic import BaseModel, Field
import os


class Settings(BaseModel):
    environment: str = Field(default=os.getenv("ENVIRONMENT", "development"))
    log_level: str = Field(default=os.getenv("LOG_LEVEL", "INFO"))
    clerk_secret_key: str | None = Field(default=os.getenv("CLERK_SECRET_KEY"))
    authorized_party: str = Field(default=os.getenv("AUTHORIZED_PARTY", "http://localhost").rstrip("/"))
    mongodb_url: str = Field(default=os.getenv("MONGODB_URL", "mongodb://mongodb:27017"))
    database_name: str = Field(default=os.getenv("DATABASE_NAME", "photure"))
    upload_dir: str = Field(default=os.getenv("UPLOAD_DIR", "/app/uploads"))
    auth_service_url: str = Field(default=os.getenv("AUTH_SERVICE_URL", "http://auth-service:8010"))
    media_service_url: str = Field(default=os.getenv("MEDIA_SERVICE_URL", "http://media-service:8030"))
    gallery_service_url: str = Field(default=os.getenv("GALLERY_SERVICE_URL", "http://gallery-service:8020"))
    max_upload_bytes: int = Field(default=int(os.getenv("MAX_UPLOAD_BYTES", 20 * 1024 * 1024)))


@lru_cache
def get_settings() -> Settings:
    return Settings()

