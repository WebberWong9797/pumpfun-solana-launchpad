from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
from app.config import settings

# Global database client
db_client: AsyncIOMotorClient = None
database = None

async def init_db():
    """Initialize database connection and create indexes."""
    global db_client, database
    
    try:
        # Create MongoDB client
        db_client = AsyncIOMotorClient(settings.MONGODB_URI)
        database = db_client[settings.database_name]
        
        # Test connection
        await db_client.admin.command('ping')
        logging.info(f"Connected to MongoDB: {settings.database_name}")
        
        # Create indexes for performance
        await create_indexes()
        
    except ConnectionFailure as e:
        logging.error(f"Failed to connect to MongoDB: {e}")
        raise

async def create_indexes():
    """Create database indexes for optimal query performance."""
    try:
        # Tokens collection indexes
        await database.tokens.create_index("mint_address", unique=True)
        await database.tokens.create_index([("name", "text"), ("symbol", "text"), ("description", "text")])
        await database.tokens.create_index("creator_wallet")
        await database.tokens.create_index([("market_cap", -1)])
        await database.tokens.create_index([("created_at", -1)])
        await database.tokens.create_index("graduation_status")
        await database.tokens.create_index([("graduation_status", 1), ("market_cap", -1)])
        await database.tokens.create_index([("is_active", 1), ("created_at", -1)])
        
        # Trading pairs collection indexes
        await database.trading_pairs.create_index("mint_address")
        await database.trading_pairs.create_index("pair_type")
        await database.trading_pairs.create_index("pool_id")
        
        # Graduations collection indexes
        await database.graduations.create_index("mint_address")
        await database.graduations.create_index([("graduation_date", -1)])
        await database.graduations.create_index("status")
        
        # Transactions collection indexes
        await database.transactions.create_index("mint_address")
        await database.transactions.create_index("transaction_signature", unique=True)
        await database.transactions.create_index("user_wallet")
        await database.transactions.create_index([("timestamp", -1)])
        await database.transactions.create_index("transaction_type")
        
        # Images collection indexes
        await database.images.create_index("uri", unique=True)
        await database.images.create_index([("created_at", -1)])
        
        logging.info("Database indexes created successfully")
        
    except Exception as e:
        logging.error(f"Failed to create database indexes: {e}")

async def get_database():
    """Get database instance."""
    return database

async def close_db():
    """Close database connection."""
    if db_client:
        db_client.close() 