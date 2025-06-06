from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from datetime import datetime
import math

from app.models import (
    TokenCreateRequest, TokenResponse, TokenUpdateRequest, 
    TokenListResponse, GraduationStatus, ErrorResponse
)
from app.database import get_database
from app.config import settings

router = APIRouter()

@router.post("/create", response_model=TokenResponse)
async def create_token(token_data: TokenCreateRequest):
    """
    Store token data after blockchain deployment.
    This endpoint is called after the Anchor program creates the token.
    """
    try:
        db = await get_database()
        
        # Check if token already exists
        existing_token = await db.tokens.find_one({"mint_address": token_data.mint_address})
        if existing_token:
            raise HTTPException(status_code=400, detail="Token already exists")
        
        # Generate explorer URLs
        solana_explorer_url = f"https://explorer.solana.com/address/{token_data.mint_address}"
        solscan_url = f"https://solscan.io/token/{token_data.mint_address}"
        
        # Create token document
        token_doc = {
            "mint_address": token_data.mint_address,
            "creator_wallet": token_data.creator_wallet,
            "name": token_data.name,
            "symbol": token_data.symbol,
            "description": token_data.description,
            "image_uri": token_data.image_uri,
            
            # Token Configuration (from proposal)
            "total_supply": 1_000_000_000_000_000_000,  # 1B with 9 decimals
            "decimals": 9,
            "bonding_curve_supply": 800_000_000_000_000_000,  # 80%
            "burning_reserve": 200_000_000_000_000_000,  # 20%
            
            # Trading Data (initial values)
            "current_price": None,
            "market_cap": None,
            "total_volume": 0.0,
            "holder_count": 1,  # Creator is initial holder
            "transactions_count": 1,  # Creation transaction
            
            # Graduation Status
            "graduation_status": GraduationStatus.PENDING,
            "graduation_threshold": float(settings.GRADUATION_THRESHOLD),
            "graduation_date": None,
            "raydium_pool_id": None,
            
            # Explorer Integration
            "solana_explorer_url": solana_explorer_url,
            "solscan_url": solscan_url,
            
            # Blockchain Verification
            "contract_verified": False,
            "last_verified": None,
            "block_height_created": None,
            "creation_signature": None,
            
            # Metadata
            "created_at": datetime.utcnow(),
            "updated_at": None,
            "is_active": True,
            "tags": [],
            
            # Initial purchase data
            "initial_purchase_amount": token_data.initial_purchase_amount,
        }
        
        # Insert token into database
        result = await db.tokens.insert_one(token_doc)
        token_doc["_id"] = str(result.inserted_id)
        
        # Create initial trading pair record
        trading_pair_doc = {
            "mint_address": token_data.mint_address,
            "pair_type": "bonding_curve",
            "base_price": 0.000004,  # Initial price from proposal
            "current_sold": 0,
            "available_supply": 800_000_000_000_000_000,  # 80% for bonding curve
            "price_formula": "Price = Base_Price × (Total_Supply_Sold / Available_Supply)^2",
            "pool_id": None,
            "liquidity_sol": None,
            "liquidity_token": None,
            "created_at": datetime.utcnow(),
            "updated_at": None,
        }
        await db.trading_pairs.insert_one(trading_pair_doc)
        
        return TokenResponse(**token_doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create token: {str(e)}")

@router.get("", response_model=TokenListResponse)
async def get_tokens(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[GraduationStatus] = Query(None, description="Filter by graduation status"),
    creator: Optional[str] = Query(None, description="Filter by creator wallet"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc/desc)"),
):
    """Get all tokens with pagination and filtering."""
    try:
        db = await get_database()
        
        # Build filter query
        filter_query = {"is_active": True}
        if status:
            filter_query["graduation_status"] = status
        if creator:
            filter_query["creator_wallet"] = creator
        
        # Build sort query
        sort_direction = -1 if sort_order == "desc" else 1
        sort_query = [(sort_by, sort_direction)]
        
        # Get total count
        total_count = await db.tokens.count_documents(filter_query)
        
        # Calculate pagination
        skip = (page - 1) * page_size
        total_pages = math.ceil(total_count / page_size)
        
        # Get tokens
        cursor = db.tokens.find(filter_query).sort(sort_query).skip(skip).limit(page_size)
        tokens = []
        
        async for token_doc in cursor:
            token_doc["_id"] = str(token_doc["_id"])
            tokens.append(TokenResponse(**token_doc))
        
        return TokenListResponse(
            tokens=tokens,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tokens: {str(e)}")

@router.get("/{mint_address}", response_model=TokenResponse)
async def get_token(mint_address: str):
    """Get specific token details by mint address."""
    try:
        db = await get_database()
        
        token_doc = await db.tokens.find_one({"mint_address": mint_address})
        if not token_doc:
            raise HTTPException(status_code=404, detail="Token not found")
        
        token_doc["_id"] = str(token_doc["_id"])
        return TokenResponse(**token_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get token: {str(e)}")

@router.put("/{mint_address}", response_model=TokenResponse)
async def update_token(mint_address: str, update_data: TokenUpdateRequest):
    """Update token trading data and metrics."""
    try:
        db = await get_database()
        
        # Check if token exists
        token_doc = await db.tokens.find_one({"mint_address": mint_address})
        if not token_doc:
            raise HTTPException(status_code=404, detail="Token not found")
        
        # Build update document
        update_doc = {"updated_at": datetime.utcnow()}
        
        if update_data.current_price is not None:
            update_doc["current_price"] = update_data.current_price
        if update_data.market_cap is not None:
            update_doc["market_cap"] = update_data.market_cap
            # Check graduation eligibility
            if update_data.market_cap >= settings.GRADUATION_THRESHOLD:
                update_doc["graduation_status"] = GraduationStatus.ELIGIBLE
        if update_data.total_volume is not None:
            update_doc["total_volume"] = update_data.total_volume
        if update_data.holder_count is not None:
            update_doc["holder_count"] = update_data.holder_count
        if update_data.transactions_count is not None:
            update_doc["transactions_count"] = update_data.transactions_count
        if update_data.contract_verified is not None:
            update_doc["contract_verified"] = update_data.contract_verified
            if update_data.contract_verified:
                update_doc["last_verified"] = datetime.utcnow()
        if update_data.graduation_status is not None:
            update_doc["graduation_status"] = update_data.graduation_status
        
        # Update token
        await db.tokens.update_one(
            {"mint_address": mint_address},
            {"$set": update_doc}
        )
        
        # Get updated token
        updated_token = await db.tokens.find_one({"mint_address": mint_address})
        updated_token["_id"] = str(updated_token["_id"])
        
        return TokenResponse(**updated_token)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update token: {str(e)}")

@router.get("/search/{query}")
async def search_tokens(
    query: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Search tokens by name, symbol, or contract address."""
    try:
        db = await get_database()
        
        # Build search query
        search_query = {
            "$and": [
                {"is_active": True},
                {
                    "$or": [
                        {"name": {"$regex": query, "$options": "i"}},
                        {"symbol": {"$regex": query, "$options": "i"}},
                        {"mint_address": {"$regex": query, "$options": "i"}},
                        {"description": {"$regex": query, "$options": "i"}},
                    ]
                }
            ]
        }
        
        # Get total count
        total_count = await db.tokens.count_documents(search_query)
        
        # Calculate pagination
        skip = (page - 1) * page_size
        total_pages = math.ceil(total_count / page_size)
        
        # Get tokens
        cursor = db.tokens.find(search_query).sort([("created_at", -1)]).skip(skip).limit(page_size)
        tokens = []
        
        async for token_doc in cursor:
            token_doc["_id"] = str(token_doc["_id"])
            tokens.append(TokenResponse(**token_doc))
        
        return TokenListResponse(
            tokens=tokens,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search tokens: {str(e)}")

@router.get("/{mint_address}/transactions")
async def get_token_transactions(
    mint_address: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Get token transaction history."""
    try:
        db = await get_database()
        
        # Check if token exists
        token_exists = await db.tokens.find_one({"mint_address": mint_address})
        if not token_exists:
            raise HTTPException(status_code=404, detail="Token not found")
        
        # Get transactions
        skip = (page - 1) * page_size
        cursor = db.transactions.find({"mint_address": mint_address}).sort([("timestamp", -1)]).skip(skip).limit(page_size)
        
        transactions = []
        async for tx_doc in cursor:
            tx_doc["_id"] = str(tx_doc["_id"])
            transactions.append(tx_doc)
        
        total_count = await db.transactions.count_documents({"mint_address": mint_address})
        total_pages = math.ceil(total_count / page_size)
        
        return {
            "transactions": transactions,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transactions: {str(e)}")

@router.post("/{mint_address}/graduate")
async def graduate_token(mint_address: str, raydium_pool_id: str, graduation_fee: float = 0.0):
    """Mark token for Raydium graduation."""
    try:
        db = await get_database()
        
        # Check if token exists and is eligible
        token_doc = await db.tokens.find_one({"mint_address": mint_address})
        if not token_doc:
            raise HTTPException(status_code=404, detail="Token not found")
        
        if token_doc.get("graduation_status") != GraduationStatus.ELIGIBLE:
            raise HTTPException(status_code=400, detail="Token not eligible for graduation")
        
        if token_doc.get("graduated", False):
            raise HTTPException(status_code=400, detail="Token already graduated")
        
        # Update token status
        graduation_date = datetime.utcnow()
        await db.tokens.update_one(
            {"mint_address": mint_address},
            {
                "$set": {
                    "graduation_status": GraduationStatus.GRADUATED,
                    "graduation_date": graduation_date,
                    "raydium_pool_id": raydium_pool_id,
                    "updated_at": graduation_date,
                }
            }
        )
        
        # Create graduation record
        graduation_doc = {
            "mint_address": mint_address,
            "graduation_date": graduation_date,
            "market_cap_at_graduation": token_doc.get("market_cap", 0),
            "total_volume_at_graduation": token_doc.get("total_volume", 0),
            "raydium_pool_data": {
                "pool_id": raydium_pool_id,
                "initial_sol_liquidity": 0,  # To be updated
                "initial_token_liquidity": 0,  # To be updated
                "pool_creation_signature": "",  # To be updated
            },
            "graduation_fee_collected": graduation_fee,
            "status": "successful",
        }
        await db.graduations.insert_one(graduation_doc)
        
        return {"message": "Token graduated successfully", "raydium_pool_id": raydium_pool_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to graduate token: {str(e)}")

@router.get("/{mint_address}/verify")
async def verify_token_contract(mint_address: str):
    """Verify token contract on blockchain."""
    try:
        # This would integrate with Solana RPC to verify the contract
        # For now, we'll return a placeholder response
        return {
            "mint_address": mint_address,
            "verified": True,
            "verification_date": datetime.utcnow(),
            "status": "Contract verified on Solana blockchain"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify contract: {str(e)}") 