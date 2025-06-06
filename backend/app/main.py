from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import images, tokens, blockchain
from app.database import init_db
from app.config import settings

# Load environment variables
load_dotenv()

app = FastAPI(
    title="PumpFun API",
    description="Backend API for PumpFun token creation and trading platform",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for image serving
os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(images.router, prefix="/api/v1/images", tags=["images"])
app.include_router(tokens.router, prefix="/api/v1/tokens", tags=["tokens"])
app.include_router(blockchain.router, prefix="/api/v1/blockchain", tags=["blockchain"])

@app.on_event("startup")
async def startup_event():
    """Initialize database connections and indexes on startup."""
    await init_db()

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected",
        "timestamp": settings.get_current_timestamp()
    }

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "PumpFun API Server",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3001,
        reload=True
    ) 