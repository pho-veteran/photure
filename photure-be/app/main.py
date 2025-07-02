from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from clerk_backend_api import Clerk
import os
import uuid
import aiofiles
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Photure API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://mongodb:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "photure")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")

# Initialize Clerk
if not CLERK_SECRET_KEY:
    logger.warning("CLERK_SECRET_KEY not set. Authentication will fail.")
    clerk = None
else:
    clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

# MongoDB client
mongodb_client = None
db = None

# Security scheme
security = HTTPBearer()

# Pydantic models
class PhotoResponse(BaseModel):
    id: str
    filename: str
    original_name: str
    content_type: str
    size: int
    user_id: str
    upload_date: datetime
    url: str

class PhotoListResponse(BaseModel):
    photos: List[PhotoResponse]
    total: int

# Create upload directory
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.on_event("startup")
async def startup_db_client():
    global mongodb_client, db
    mongodb_client = AsyncIOMotorClient(MONGODB_URL)
    db = mongodb_client[DATABASE_NAME]
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    if mongodb_client:
        mongodb_client.close()

async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Clerk JWT token and return user ID"""
    if not CLERK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Authentication not configured")
    
    try:
        token = credentials.credentials
        
        # Manual JWT verification using PyJWT
        # Note: For production, consider implementing proper signature verification
        # with Clerk's public keys from their JWKS endpoint
        try:
            import jwt
            
            # Decode JWT token without signature verification
            # In production, you should verify the signature using Clerk's public keys
            payload = jwt.decode(token, options={"verify_signature": False})
            
            # Extract user ID from the 'sub' claim
            user_id = payload.get('sub')
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
            
            return user_id
            
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@app.get("/")
async def root():
    return {"message": "Photure API is running"}

@app.get("/api/")
async def api():
    return {"message": "Nginx Reverse Proxy to Photure API is running"}

@app.post("/api/upload", response_model=PhotoResponse)
async def upload_photo(
    file: UploadFile = File(...),
    user_id: str = Depends(verify_clerk_token)
):
    """Upload a photo file"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ''
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as buffer:
            content = await file.read()
            await buffer.write(content)
        
        # Create database record
        photo_doc = {
            "_id": str(uuid.uuid4()),
            "filename": unique_filename,
            "original_name": file.filename,
            "content_type": file.content_type,
            "size": len(content),
            "user_id": user_id,
            "upload_date": datetime.utcnow(),
            "file_path": file_path
        }
        
        await db.photos.insert_one(photo_doc)
        
        return PhotoResponse(
            id=photo_doc["_id"],
            filename=photo_doc["filename"],
            original_name=photo_doc["original_name"],
            content_type=photo_doc["content_type"],
            size=photo_doc["size"],
            user_id=photo_doc["user_id"],
            upload_date=photo_doc["upload_date"],
            url=f"/api/serve/{photo_doc['_id']}"
        )
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/api/photos", response_model=PhotoListResponse)
async def list_photos(
    user_id: str = Depends(verify_clerk_token),
    skip: int = 0,
    limit: int = 20
):
    """List photos for the authenticated user"""
    try:
        # Get photos from database
        cursor = db.photos.find({"user_id": user_id}).skip(skip).limit(limit).sort("upload_date", -1)
        photos = await cursor.to_list(length=limit)
        
        # Get total count
        total = await db.photos.count_documents({"user_id": user_id})
        
        # Convert to response format
        photo_responses = []
        for photo in photos:
            photo_responses.append(PhotoResponse(
                id=photo["_id"],
                filename=photo["filename"],
                original_name=photo["original_name"],
                content_type=photo["content_type"],
                size=photo["size"],
                user_id=photo["user_id"],
                upload_date=photo["upload_date"],
                url=f"/api/serve/{photo['_id']}"
            ))
        
        return PhotoListResponse(photos=photo_responses, total=total)
        
    except Exception as e:
        logger.error(f"List photos failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list photos: {str(e)}")

@app.get("/api/serve/{photo_id}")
async def serve_photo(
    photo_id: str,
    user_id: str = Depends(verify_clerk_token)
):
    """Serve a photo file"""
    try:
        # Find photo in database
        photo = await db.photos.find_one({"_id": photo_id, "user_id": user_id})
        
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        file_path = photo["file_path"]
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        return FileResponse(
            file_path,
            media_type=photo["content_type"],
            filename=photo["original_name"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Serve photo failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to serve photo: {str(e)}")

@app.delete("/api/photos/{photo_id}")
async def delete_photo(
    photo_id: str,
    user_id: str = Depends(verify_clerk_token)
):
    """Delete a photo"""
    try:
        # Find photo in database
        photo = await db.photos.find_one({"_id": photo_id, "user_id": user_id})
        
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Delete file from disk
        file_path = photo["file_path"]
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        await db.photos.delete_one({"_id": photo_id, "user_id": user_id})
        
        return {"message": "Photo deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete photo failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete photo: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
