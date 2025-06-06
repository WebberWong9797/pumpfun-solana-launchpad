from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class GraduationStatus(str, Enum):
    PENDING = "pending"
    ELIGIBLE = "eligible"
    GRADUATED = "graduated"
    FAILED = "failed"

class TransactionType(str, Enum):
    BUY = "buy"
    SELL = "sell"
    CREATE = "create"

class PairType(str, Enum):
    BONDING_CURVE = "bonding_curve"
    RAYDIUM_POOL = "raydium_pool"

class GraduationStatusEnum(str, Enum):
    SUCCESSFUL = "successful"
    FAILED = "failed"
    PENDING = "pending"

# Token Models
class TokenCreateRequest(BaseModel):
    mint_address: str = Field(..., description="Token mint address")
    name: str = Field(..., max_length=32, description="Token name")
    symbol: str = Field(..., max_length=10, description="Token symbol")
    description: str = Field(..., max_length=500, description="Token description")
    image_uri: str = Field(..., max_length=200, description="Token image URI")
    creator_wallet: str = Field(..., description="Creator wallet address")
    initial_purchase_amount: Optional[int] = Field(None, description="Optional SOL amount for initial purchase (in lamports)")

class TokenResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    mint_address: str
    creator_wallet: str
    name: str
    symbol: str
    description: str
    image_uri: str
    
    # Token Configuration
    total_supply: int = 1_000_000_000_000_000_000  # 1B with 9 decimals
    decimals: int = 9
    bonding_curve_supply: int = 800_000_000_000_000_000  # 80%
    burning_reserve: int = 200_000_000_000_000_000  # 20%
    
    # Trading Data
    current_price: Optional[float] = None
    market_cap: Optional[float] = None
    total_volume: Optional[float] = None
    holder_count: Optional[int] = None
    transactions_count: Optional[int] = None
    
    # Graduation Status
    graduation_status: GraduationStatus = GraduationStatus.PENDING
    graduation_threshold: float = 69000.0
    graduation_date: Optional[datetime] = None
    raydium_pool_id: Optional[str] = None
    
    # Explorer Integration
    solana_explorer_url: Optional[str] = None
    solscan_url: Optional[str] = None
    
    # Blockchain Verification
    contract_verified: bool = False
    last_verified: Optional[datetime] = None
    block_height_created: Optional[int] = None
    creation_signature: Optional[str] = None
    
    # Metadata
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool = True
    tags: List[str] = []

    class Config:
        populate_by_name = True

class TokenUpdateRequest(BaseModel):
    current_price: Optional[float] = None
    market_cap: Optional[float] = None
    total_volume: Optional[float] = None
    holder_count: Optional[int] = None
    transactions_count: Optional[int] = None
    contract_verified: Optional[bool] = None
    graduation_status: Optional[GraduationStatus] = None

class TokenListResponse(BaseModel):
    tokens: List[TokenResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int

# Trading Pair Models
class TradingPairResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    mint_address: str
    pair_type: PairType
    
    # Bonding Curve Data
    base_price: Optional[float] = None
    current_sold: Optional[int] = None
    available_supply: Optional[int] = None
    price_formula: Optional[str] = None
    
    # Pool Data (after graduation)
    pool_id: Optional[str] = None
    liquidity_sol: Optional[float] = None
    liquidity_token: Optional[int] = None
    
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

# Graduation Models
class GraduationResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    mint_address: str
    graduation_date: datetime
    market_cap_at_graduation: float
    total_volume_at_graduation: float
    raydium_pool_data: dict
    graduation_fee_collected: float
    status: GraduationStatusEnum

    class Config:
        populate_by_name = True

# Transaction Models
class TransactionResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    mint_address: str
    transaction_signature: str
    user_wallet: str
    transaction_type: TransactionType
    
    # Transaction Details
    sol_amount: float
    token_amount: int
    price_per_token: float
    
    # Market Impact
    market_cap_before: Optional[float] = None
    market_cap_after: Optional[float] = None
    
    timestamp: datetime
    block_height: Optional[int] = None

    class Config:
        populate_by_name = True

# Image Models
class ImageUploadResponse(BaseModel):
    uri: str
    filename: str
    size: int
    content_type: str
    url: str
    created_at: datetime

# Blockchain Verification Models
class BlockchainVerificationResponse(BaseModel):
    mint_address: str
    exists: bool
    verified: bool
    owner: Optional[str] = None
    supply: Optional[int] = None
    decimals: Optional[int] = None
    freeze_authority: Optional[str] = None
    mint_authority: Optional[str] = None

class TransactionVerificationResponse(BaseModel):
    signature: str
    confirmed: bool
    slot: Optional[int] = None
    block_time: Optional[datetime] = None
    status: str
    fee: Optional[int] = None

# Analytics Models
class PlatformAnalytics(BaseModel):
    total_tokens_created: int
    active_traders: int
    graduated_tokens: int
    total_trading_volume: float
    daily_transactions: int
    platform_revenue: float

# Error Models
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None 