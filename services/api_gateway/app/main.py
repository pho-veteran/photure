import asyncio
from typing import Any

import httpx
from fastapi import Depends, FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from services.common.config import get_settings
from services.common.logging import configure_logger
from services.common.schemas import PhotoListResponse, PhotoResponse, ServiceHealth, VerifyResponse


settings = get_settings()
logger = configure_logger("api-gateway")

app = FastAPI(title="Photure API Gateway", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI(title="Photure API Gateway", version="0.1.0")


@app.on_event("startup")
async def startup():
    app.state.http_client = httpx.AsyncClient(timeout=30)


@app.on_event("shutdown")
async def shutdown():
    client: httpx.AsyncClient = app.state.http_client
    await client.aclose()


def get_http_client() -> httpx.AsyncClient:
    client: httpx.AsyncClient = app.state.http_client
    return client


async def verify_user(request: Request, client: httpx.AsyncClient) -> VerifyResponse:
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        response = await client.post(
            f"{settings.auth_service_url}/verify",
            headers={"Authorization": token},
        )
    except httpx.RequestError as exc:
        logger.exception("Auth service unreachable")
        raise HTTPException(status_code=503, detail="Auth service unavailable") from exc

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json().get("detail"))

    data = response.json()
    return VerifyResponse(**data)


def hydrate_photo(photo: dict) -> PhotoResponse:
    return PhotoResponse(
        **photo,
        url=f"/api/serve/{photo['id']}",
    )


@app.get("/health", response_model=ServiceHealth)
async def health() -> ServiceHealth:
    return ServiceHealth(
        name="api-gateway",
        status="ok",
        message="Ready",
    )


@app.post("/api/upload")
async def upload_photo(
    request: Request,
    file: UploadFile = File(...),
    client: httpx.AsyncClient = Depends(get_http_client),
):
    user = await verify_user(request, client)

    file_bytes = await file.read()
    files = {"file": (file.filename, file_bytes, file.content_type)}

    try:
        media_resp = await client.post(f"{settings.media_service_url}/media/upload", files=files)
    except httpx.RequestError as exc:
        logger.exception("Media service unreachable")
        raise HTTPException(status_code=503, detail="Media service unavailable") from exc

    if media_resp.status_code != 200:
        raise HTTPException(status_code=media_resp.status_code, detail=media_resp.json().get("detail"))

    media_data = media_resp.json()

    gallery_payload = {
        "storage_key": media_data["storage_key"],
        "filename": media_data["filename"],
        "original_name": file.filename or media_data["filename"],
        "content_type": media_data["content_type"],
        "size": media_data["size"],
        "user_id": user.user_id,
    }

    try:
        gallery_resp = await client.post(
            f"{settings.gallery_service_url}/gallery/photos",
            json=gallery_payload,
        )
    except httpx.RequestError as exc:
        logger.exception("Gallery service unreachable")
        raise HTTPException(status_code=503, detail="Gallery service unavailable") from exc

    if gallery_resp.status_code != 200:
        # roll back media upload asynchronously
        asyncio.create_task(
            client.delete(f"{settings.media_service_url}/media/{media_data['storage_key']}")
        )
        raise HTTPException(status_code=gallery_resp.status_code, detail=gallery_resp.json().get("detail"))

    photo = gallery_resp.json()
    hydrated = hydrate_photo(photo)
    return hydrated


@app.get("/api/photos", response_model=PhotoListResponse)
async def list_photos(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    client: httpx.AsyncClient = Depends(get_http_client),
):
    user = await verify_user(request, client)

    try:
        gallery_resp = await client.get(
            f"{settings.gallery_service_url}/gallery/photos",
            params={"skip": skip, "limit": limit},
            headers={"X-User-Id": user.user_id},
        )
    except httpx.RequestError as exc:
        logger.exception("Gallery service unreachable")
        raise HTTPException(status_code=503, detail="Gallery service unavailable") from exc

    if gallery_resp.status_code != 200:
        raise HTTPException(status_code=gallery_resp.status_code, detail=gallery_resp.json().get("detail"))

    payload = gallery_resp.json()
    photos = [hydrate_photo(photo) for photo in payload["photos"]]

    return PhotoListResponse(photos=photos, total=payload["total"])


@app.get("/api/serve/{photo_id}")
async def serve_photo(
    photo_id: str,
    request: Request,
    client: httpx.AsyncClient = Depends(get_http_client),
) -> Any:
    user = await verify_user(request, client)

    try:
        meta_resp = await client.get(
            f"{settings.gallery_service_url}/gallery/photos/{photo_id}",
            headers={"X-User-Id": user.user_id},
        )
    except httpx.RequestError as exc:
        logger.exception("Gallery service unreachable")
        raise HTTPException(status_code=503, detail="Gallery service unavailable") from exc

    if meta_resp.status_code != 200:
        raise HTTPException(status_code=meta_resp.status_code, detail=meta_resp.json().get("detail"))

    photo = meta_resp.json()

    media_url = f"{settings.media_service_url}/media/{photo['storage_key']}"
    params = {
        "download_name": photo["original_name"],
        "content_type": photo["content_type"],
    }

    try:
        media_resp = await client.get(media_url, params=params)
    except httpx.RequestError as exc:
        logger.exception("Media service unreachable")
        raise HTTPException(status_code=503, detail="Media service unavailable") from exc

    if media_resp.status_code != 200:
        raise HTTPException(status_code=media_resp.status_code, detail=media_resp.json().get("detail"))

    disposition = f'inline; filename="{photo["original_name"]}"'
    return StreamingResponse(
        iter([media_resp.content]),
        media_type=photo["content_type"],
        headers={"Content-Disposition": disposition},
    )


@app.delete("/api/photos/{photo_id}")
async def delete_photo(
    photo_id: str,
    request: Request,
    client: httpx.AsyncClient = Depends(get_http_client),
) -> JSONResponse:
    user = await verify_user(request, client)

    try:
        gallery_resp = await client.delete(
            f"{settings.gallery_service_url}/gallery/photos/{photo_id}",
            headers={"X-User-Id": user.user_id},
        )
    except httpx.RequestError as exc:
        logger.exception("Gallery service unreachable")
        raise HTTPException(status_code=503, detail="Gallery service unavailable") from exc

    if gallery_resp.status_code != 200:
        raise HTTPException(status_code=gallery_resp.status_code, detail=gallery_resp.json().get("detail"))

    delete_payload = gallery_resp.json()
    storage_key = delete_payload["storage_key"]

    try:
        await client.delete(f"{settings.media_service_url}/media/{storage_key}")
    except httpx.RequestError:
        logger.warning("Failed to delete media %s after metadata removal", storage_key)

    return JSONResponse({"message": "Photo deleted successfully"})

