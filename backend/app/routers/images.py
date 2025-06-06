from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import FileResponse
import os
import uuid
import aiofiles
import io
from PIL import Image
from datetime import datetime
import hashlib

from app.models import ImageUploadResponse
from app.database import get_database
from app.config import settings

router = APIRouter()

@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """Upload image and generate URI for token creation."""
    try:
        # Validate file type
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )
        
        # Read file content
        content = await file.read()
        
        # Validate file size
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Generate unique filename
        file_hash = hashlib.md5(content).hexdigest()
        file_extension = file.filename.split('.')[-1].lower()
        unique_filename = f"{file_hash}.{file_extension}"
        
        # Create upload directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Check if file already exists
        if os.path.exists(file_path):
            # File already exists, return existing URI
            db = await get_database()
            existing_image = await db.images.find_one({"filename": unique_filename})
            if existing_image:
                existing_image["_id"] = str(existing_image["_id"])
                return ImageUploadResponse(**existing_image)
        
        # Process and save image
        try:
            # Open and process image with PIL
            image = Image.open(io.BytesIO(content))
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Resize if too large (max 1024x1024)
            max_size = (1024, 1024)
            if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            image.save(file_path, optimize=True, quality=85)
            
        except Exception as e:
            # If PIL processing fails, save original file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
        
        # Generate URI and URL
        uri = f"img_{file_hash}"
        file_url = f"{settings.API_BASE_URL}/static/images/{unique_filename}"
        
        # Get file stats
        file_stats = os.stat(file_path)
        
        # Store image metadata in database
        db = await get_database()
        image_doc = {
            "uri": uri,
            "filename": unique_filename,
            "original_filename": file.filename,
            "size": file_stats.st_size,
            "content_type": file.content_type,
            "url": file_url,
            "file_path": file_path,
            "hash": file_hash,
            "created_at": datetime.utcnow(),
        }
        
        result = await db.images.insert_one(image_doc)
        image_doc["_id"] = str(result.inserted_id)
        
        return ImageUploadResponse(
            uri=uri,
            filename=unique_filename,
            size=file_stats.st_size,
            content_type=file.content_type,
            url=file_url,
            created_at=image_doc["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@router.get("/{uri}")
async def get_image(uri: str):
    """Retrieve image by URI."""
    try:
        db = await get_database()
        
        # Find image by URI
        image_doc = await db.images.find_one({"uri": uri})
        if not image_doc:
            raise HTTPException(status_code=404, detail="Image not found")
        
        file_path = image_doc["file_path"]
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Image file not found")
        
        # Return file
        return FileResponse(
            path=file_path,
            media_type=image_doc["content_type"],
            filename=image_doc["original_filename"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve image: {str(e)}") 