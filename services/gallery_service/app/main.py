from datetime import datetime
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from typing import Annotated
import uuid

from services.common.config import get_settings
from services.common.logging import configure_logger
from services.common.mongo import lifespan, get_database
from services.common.schemas import (
    CreatePhotoRequest,
    DeletePhotoResult,
    PhotoMetadata,
    PhotoMetadataList,
    ServiceHealth,
)


settings = get_settings()
logger = configure_logger("gallery-service")

app = FastAPI(title="Photure Gallery Service", version="0.1.0", lifespan=lifespan)


def get_collection():
    db = get_database()
    return db.photos


async def get_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> str:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing user context")
    return x_user_id


@app.get("/health", response_model=ServiceHealth)
async def health() -> ServiceHealth:
    return ServiceHealth(
        name="gallery-service",
        status="ok",
        message=f"Environment: {settings.environment}",
    )


def serialize_photo(doc: dict) -> PhotoMetadata:
    return PhotoMetadata(
        id=doc["_id"],
        filename=doc["filename"],
        original_name=doc["original_name"],
        content_type=doc["content_type"],
        size=doc["size"],
        user_id=doc["user_id"],
        upload_date=doc["upload_date"],
        storage_key=doc["storage_key"],
    )


@app.post("/gallery/photos", response_model=PhotoMetadata)
async def create_photo(
    payload: CreatePhotoRequest,
):
    logger.debug("Creating photo metadata for %s", payload.user_id)
    collection = get_collection()

    photo_doc = {
        "_id": str(uuid.uuid4()),
        "filename": payload.filename,
        "original_name": payload.original_name,
        "content_type": payload.content_type,
        "size": payload.size,
        "user_id": payload.user_id,
        "upload_date": datetime.utcnow(),
        "storage_key": payload.storage_key,
    }

    await collection.insert_one(photo_doc)
    return serialize_photo(photo_doc)


@app.get("/gallery/photos", response_model=PhotoMetadataList)
async def list_photos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_user_id),
) -> PhotoMetadataList:
    collection = get_collection()
    cursor = (
        collection.find({"user_id": user_id})
        .skip(skip)
        .limit(limit)
        .sort("upload_date", -1)
    )
    photos = await cursor.to_list(length=limit)
    total = await collection.count_documents({"user_id": user_id})

    return PhotoMetadataList(
        photos=[serialize_photo(photo) for photo in photos],
        total=total,
    )


@app.get("/gallery/photos/{photo_id}", response_model=PhotoMetadata)
async def get_photo(photo_id: str, user_id: str = Depends(get_user_id)) -> PhotoMetadata:
    collection = get_collection()
    photo = await collection.find_one({"_id": photo_id, "user_id": user_id})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return serialize_photo(photo)


@app.delete("/gallery/photos/{photo_id}", response_model=DeletePhotoResult)
async def delete_photo(photo_id: str, user_id: str = Depends(get_user_id)) -> DeletePhotoResult:
    collection = get_collection()
    photo = await collection.find_one({"_id": photo_id, "user_id": user_id})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    await collection.delete_one({"_id": photo_id, "user_id": user_id})
    logger.info("Deleted photo metadata %s for %s", photo_id, user_id)
    return DeletePhotoResult(storage_key=photo["storage_key"])

