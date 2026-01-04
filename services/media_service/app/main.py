import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse

from services.common.config import get_settings
from services.common.logging import configure_logger
from services.common.schemas import MediaUploadResponse, ServiceHealth


settings = get_settings()
logger = configure_logger("media-service")


def get_upload_dir() -> Path:
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path

app = FastAPI(title="Photure Media Service", version="0.1.0")


@app.get("/health", response_model=ServiceHealth)
async def health() -> ServiceHealth:
    return ServiceHealth(
        name="media-service",
        status="ok",
        message=f"Environment: {settings.environment}",
    )


@app.post("/media/upload", response_model=MediaUploadResponse)
async def upload_media(file: UploadFile = File(...)) -> MediaUploadResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    contents = await file.read()
    if len(contents) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File exceeds max upload size")

    extension = Path(file.filename).suffix if file.filename else ""
    storage_key = f"{uuid.uuid4()}{extension}"
    destination = get_upload_dir() / storage_key

    async with aiofiles.open(destination, "wb") as buffer:
        await buffer.write(contents)

    logger.info("Stored media %s (%s bytes)", storage_key, len(contents))

    return MediaUploadResponse(
        storage_key=storage_key,
        filename=file.filename or storage_key,
        content_type=file.content_type or "application/octet-stream",
        size=len(contents),
    )


@app.get("/media/{storage_key}")
async def fetch_media(
    storage_key: str,
    download_name: str | None = Query(default=None),
    content_type: str | None = Query(default=None),
):
    file_path = get_upload_dir() / storage_key
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Media not found")

    return FileResponse(
        file_path,
        media_type=content_type or "application/octet-stream",
        filename=download_name or storage_key,
    )


@app.delete("/media/{storage_key}")
async def delete_media(storage_key: str):
    file_path = get_upload_dir() / storage_key
    if file_path.exists():
        os.remove(file_path)
        logger.info("Deleted media %s", storage_key)
        return {"deleted": True}

    raise HTTPException(status_code=404, detail="Media not found")

