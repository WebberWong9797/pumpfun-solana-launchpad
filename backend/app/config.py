import os
from datetime import datetime
from typing import Optional

class Settings:
    # Database Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/pumpfun")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Admin Configuration
    ADMIN_WALLET_ADDRESS: str = os.getenv("NEXT_PUBLIC_ADMIN_WALLET_ADDRESS", "")
    ADMIN_BURNING_WALLET_ADDRESS: str = os.getenv("ADMIN_BURNING_WALLET_ADDRESS", "")
    
    # Platform Configuration
    PLATFORM_NAME: str = os.getenv("NEXT_PUBLIC_PLATFORM_NAME", "PumpFun")
    GRADUATION_THRESHOLD: int = int(os.getenv("NEXT_PUBLIC_GRADUATION_THRESHOLD", "69000"))
    
    # Solana Configuration
    SOLANA_RPC_URL: str = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
    TOKEN_FACTORY_PROGRAM_ID: str = os.getenv("TOKEN_FACTORY_PROGRAM_ID", "")
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    UPLOAD_DIR: str = "static/images"
    
    # API Configuration
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:3001")
    
    @staticmethod
    def get_current_timestamp() -> int:
        """Get current timestamp in seconds."""
        return int(datetime.now().timestamp())
    
    @property
    def database_name(self) -> str:
        """Extract database name from MongoDB URI."""
        return self.MONGODB_URI.split("/")[-1]

# Global settings instance
settings = Settings() 