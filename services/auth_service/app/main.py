import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from fastapi import FastAPI, Header, HTTPException

from services.common.config import get_settings
from services.common.logging import configure_logger
from services.common.schemas import ServiceHealth, VerifyResponse


settings = get_settings()
logger = configure_logger("auth-service")

if not settings.clerk_secret_key:
    logger.warning("CLERK_SECRET_KEY is not configured; all requests will fail.")
    clerk_sdk: Clerk | None = None
else:
    clerk_sdk = Clerk(bearer_auth=settings.clerk_secret_key)

app = FastAPI(title="Photure Auth Service", version="0.1.0")


@app.get("/health", response_model=ServiceHealth)
async def health() -> ServiceHealth:
    return ServiceHealth(
        name="auth-service",
        status="ok",
        message=f"Environment: {settings.environment}",
    )


@app.post("/verify", response_model=VerifyResponse)
async def verify_token(authorization: str = Header(None, alias="Authorization")) -> VerifyResponse:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if not clerk_sdk:
        raise HTTPException(status_code=500, detail="Authentication not configured")

    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    headers = {"Authorization": f"Bearer {token}"}
    mock_request = httpx.Request("GET", settings.authorized_party, headers=headers)

    try:
        request_state = clerk_sdk.authenticate_request(
            mock_request,
            AuthenticateRequestOptions(
                authorized_parties=[settings.authorized_party],
            ),
        )
    except Exception as exc:
        logger.exception("Authentication failed")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {exc}") from exc

    if not request_state.is_signed_in or not request_state.payload:
        raise HTTPException(status_code=401, detail="User not signed in")

    user_id = request_state.payload.get("sub")
    session_id = request_state.payload.get("sid")

    if not user_id:
        raise HTTPException(status_code=401, detail="User ID missing in token")

    return VerifyResponse(user_id=user_id, session_id=session_id)

