from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List


class ServiceHealth(BaseModel):
    name: str
    status: str
    version: str = Field(default="0.1.0")
    message: Optional[str] = None


class VerifyResponse(BaseModel):
    user_id: str
    session_id: Optional[str] = None


class MediaUploadResponse(BaseModel):
    storage_key: str
    filename: str
    content_type: str
    size: int


class PhotoMetadata(BaseModel):
    id: str
    filename: str
    original_name: str
    content_type: str
    size: int
    user_id: str
    upload_date: datetime
    storage_key: str


class PhotoResponse(PhotoMetadata):
    url: str


class PhotoListResponse(BaseModel):
    photos: List[PhotoResponse]
    total: int


class PhotoMetadataList(BaseModel):
    photos: List[PhotoMetadata]
    total: int


class DeletePhotoResult(BaseModel):
    storage_key: str
    deleted: bool = True


class CreatePhotoRequest(BaseModel):
    storage_key: str
    filename: str
    original_name: str
    content_type: str
    size: int
    user_id: str

