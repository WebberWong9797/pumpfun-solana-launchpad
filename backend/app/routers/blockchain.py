from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
import httpx
from datetime import datetime

from app.models import (
    BlockchainVerificationResponse, 
    TransactionVerificationResponse,
    PlatformAnalytics
)
from app.database import get_database
from app.config import settings

router = APIRouter()

@router.get("/verify/token/{mint_address}")
async def verify_token_on_chain(mint_address: str):
    """Verify token exists on Solana blockchain."""
    try:
        # Make RPC call to Solana to verify token
        async with httpx.AsyncClient() as client:
            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getAccountInfo",
                "params": [
                    mint_address,
                    {"encoding": "jsonParsed"}
                ]
            }
            
            response = await client.post(settings.SOLANA_RPC_URL, json=payload)
            result = response.json()
            
            if result.get("result", {}).get("value") is None:
                return BlockchainVerificationResponse(
                    mint_address=mint_address,
                    exists=False,
                    verified=False
                )
            
            # Parse account data
            account_data = result["result"]["value"]["data"]["parsed"]["info"]
            
            return BlockchainVerificationResponse(
                mint_address=mint_address,
                exists=True,
                verified=True,
                owner=account_data.get("mintAuthority"),
                supply=int(account_data.get("supply", 0)),
                decimals=account_data.get("decimals", 0),
                freeze_authority=account_data.get("freezeAuthority"),
                mint_authority=account_data.get("mintAuthority")
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify token: {str(e)}")

@router.get("/verify/transaction/{signature}")
async def verify_transaction(signature: str):
    """Verify transaction exists on Solana blockchain."""
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getTransaction",
                "params": [
                    signature,
                    {"encoding": "json", "maxSupportedTransactionVersion": 0}
                ]
            }
            
            response = await client.post(settings.SOLANA_RPC_URL, json=payload)
            result = response.json()
            
            if result.get("result") is None:
                return TransactionVerificationResponse(
                    signature=signature,
                    confirmed=False,
                    status="not_found"
                )
            
            tx_data = result["result"]
            
            return TransactionVerificationResponse(
                signature=signature,
                confirmed=True,
                slot=tx_data.get("slot"),
                block_time=datetime.fromtimestamp(tx_data.get("blockTime", 0)) if tx_data.get("blockTime") else None,
                status="confirmed" if tx_data.get("meta", {}).get("err") is None else "failed",
                fee=tx_data.get("meta", {}).get("fee")
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify transaction: {str(e)}")

@router.get("/network/info")
async def get_network_info():
    """Get Solana network information."""
    try:
        async with httpx.AsyncClient() as client:
            # Get slot
            slot_payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getSlot"
            }
            
            # Get epoch info
            epoch_payload = {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "getEpochInfo"
            }
            
            slot_response = await client.post(settings.SOLANA_RPC_URL, json=slot_payload)
            epoch_response = await client.post(settings.SOLANA_RPC_URL, json=epoch_payload)
            
            slot_result = slot_response.json()
            epoch_result = epoch_response.json()
            
            return {
                "network": "devnet" if "devnet" in settings.SOLANA_RPC_URL else "mainnet",
                "current_slot": slot_result.get("result"),
                "epoch_info": epoch_result.get("result"),
                "rpc_url": settings.SOLANA_RPC_URL,
                "timestamp": datetime.utcnow()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get network info: {str(e)}")

@router.get("/analytics/platform")
async def get_platform_analytics():
    """Get platform-wide analytics and statistics."""
    try:
        db = await get_database()
        
        # Get basic statistics
        total_tokens = await db.tokens.count_documents({"is_active": True})
        graduated_tokens = await db.tokens.count_documents({"graduation_status": "graduated"})
        
        # Get total volume (sum of all token volumes)
        volume_pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {"_id": None, "total_volume": {"$sum": "$total_volume"}}}
        ]
        volume_result = await db.tokens.aggregate(volume_pipeline).to_list(1)
        total_volume = volume_result[0]["total_volume"] if volume_result else 0.0
        
        # Get active traders (unique wallets in last 24 hours)
        from datetime import timedelta
        yesterday = datetime.utcnow() - timedelta(days=1)
        
        active_traders_pipeline = [
            {"$match": {"timestamp": {"$gte": yesterday}}},
            {"$group": {"_id": "$user_wallet"}},
            {"$count": "active_traders"}
        ]
        traders_result = await db.transactions.aggregate(active_traders_pipeline).to_list(1)
        active_traders = traders_result[0]["active_traders"] if traders_result else 0
        
        # Get daily transactions
        daily_transactions = await db.transactions.count_documents({
            "timestamp": {"$gte": yesterday}
        })
        
        # Platform revenue (graduation fees)
        revenue_pipeline = [
            {"$group": {"_id": None, "total_revenue": {"$sum": "$graduation_fee_collected"}}}
        ]
        revenue_result = await db.graduations.aggregate(revenue_pipeline).to_list(1)
        platform_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0.0
        
        return PlatformAnalytics(
            total_tokens_created=total_tokens,
            active_traders=active_traders,
            graduated_tokens=graduated_tokens,
            total_trading_volume=total_volume,
            daily_transactions=daily_transactions,
            platform_revenue=platform_revenue
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.post("/sync/token/{mint_address}")
async def sync_token_from_blockchain(mint_address: str):
    """Sync token data from blockchain to database."""
    try:
        # Verify token exists on chain
        verification = await verify_token_on_chain(mint_address)
        
        if not verification.verified:
            raise HTTPException(status_code=404, detail="Token not found on blockchain")
        
        # Update database with verified data
        db = await get_database()
        
        update_doc = {
            "contract_verified": True,
            "last_verified": datetime.utcnow(),
        }
        
        if verification.supply:
            update_doc["verified_supply"] = verification.supply
        if verification.decimals:
            update_doc["verified_decimals"] = verification.decimals
        if verification.owner:
            update_doc["verified_owner"] = verification.owner
        
        result = await db.tokens.update_one(
            {"mint_address": mint_address},
            {"$set": update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Token not found in database")
        
        return {
            "message": "Token synced successfully",
            "mint_address": mint_address,
            "verification": verification,
            "updated_fields": list(update_doc.keys())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync token: {str(e)}")

@router.get("/explorer/{address}")
async def get_explorer_links(address: str):
    """Get explorer links for an address."""
    return {
        "address": address,
        "solana_explorer": f"https://explorer.solana.com/address/{address}",
        "solscan": f"https://solscan.io/address/{address}",
        "solana_fm": f"https://solana.fm/address/{address}",
        "network": "devnet" if "devnet" in settings.SOLANA_RPC_URL else "mainnet"
    } 