# Create Coin Functionality

This document explains how to use the create coin functionality that has been implemented following the proposal.

## Overview

The create coin feature allows users to create new meme coins on Solana with the following specifications:
- 1 billion token supply with 9 decimals
- 80% allocated to bonding curve trading
- 20% allocated to burning wallet
- No creation fees (completely free)
- Optional initial purchase to prevent sniping

## Architecture

### 1. Anchor Smart Contract (`anchor/programs/token-factory/`)

The Anchor program handles:
- Token mint creation with proper authorities
- Token distribution (80/20 split)
- Initial purchase functionality
- Token metadata storage on-chain

Key functions:
- `create_token()` - Main token creation function
- `update_trading_data()` - Updates trading metrics
- `graduate_token()` - Handles Raydium graduation

### 2. Python Backend (`backend/`)

The FastAPI backend provides:
- Image upload and processing
- Token metadata storage in MongoDB
- Blockchain verification
- API endpoints for frontend integration

Key endpoints:
- `POST /api/v1/images/upload` - Upload token images
- `POST /api/v1/tokens/create` - Store token data
- `GET /api/v1/tokens` - List tokens with pagination
- `GET /api/v1/tokens/{mint_address}` - Get specific token

### 3. Frontend (`src/`)

The Next.js frontend includes:
- Multi-step token creation form
- Image upload with validation
- Real-time preview
- Wallet integration
- Transaction handling

Key components:
- `CreateTokenFeature` - Main creation flow
- `CreateTokenForm` - Token details form
- `CreateTokenPreview` - Review and confirmation
- `useCreateToken` - Token creation hook

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Admin wallet addresses
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=your_admin_wallet_here
ADMIN_BURNING_WALLET_ADDRESS=your_burning_wallet_here

# Solana configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
TOKEN_FACTORY_PROGRAM_ID=your_deployed_program_id

# Database
MONGODB_URI=mongodb://localhost:27017/pumpfun
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 3001
```

### 3. Anchor Program Deployment

```bash
cd anchor
anchor build
anchor deploy
# Update TOKEN_FACTORY_PROGRAM_ID in .env with deployed program ID
```

### 4. Frontend Setup

```bash
npm install
npm run dev
```

## Usage Flow

1. **Connect Wallet**: User connects their Solana wallet
2. **Fill Form**: Enter token name, symbol, description, and upload image
3. **Review**: Preview token details and configuration
4. **Create**: Sign transaction to deploy token on Solana
5. **Success**: Token is created and stored in database

## Token Specifications

- **Total Supply**: 1,000,000,000 tokens (1B)
- **Decimals**: 9
- **Bonding Curve Supply**: 800,000,000 tokens (80%)
- **Burning Reserve**: 200,000,000 tokens (20%)
- **Creation Fee**: FREE
- **Initial Purchase**: Optional (prevents sniping)

## Database Schema

### Tokens Collection
```javascript
{
  mint_address: String (unique),
  creator_wallet: String,
  name: String (max 32 chars),
  symbol: String (max 10 chars),
  description: String (max 500 chars),
  image_uri: String,
  total_supply: Number,
  bonding_curve_supply: Number,
  burning_reserve: Number,
  graduation_status: Enum,
  created_at: Date,
  // ... additional fields
}
```

## API Integration

The frontend communicates with the backend through REST APIs:

1. **Image Upload**: `POST /api/v1/images/upload`
2. **Token Creation**: `POST /api/v1/tokens/create`
3. **Token Listing**: `GET /api/v1/tokens`

## Security Features

- Input validation on all fields
- Image size and type restrictions
- Wallet signature verification
- Admin-only token authorities
- Secure token distribution

## Future Enhancements

- Real Anchor program integration (currently simulated)
- Bonding curve trading implementation
- Raydium graduation automation
- Advanced token analytics
- Social features and comments

## Troubleshooting

### Common Issues

1. **Wallet Connection**: Ensure wallet is connected and on correct network
2. **Image Upload**: Check file size (<5MB) and format (PNG, JPG, GIF)
3. **Backend Connection**: Verify backend is running on port 3001
4. **Database**: Ensure MongoDB is running and accessible

### Error Messages

- "Wallet not connected" - Connect your Solana wallet
- "Failed to upload image" - Check image format and size
- "Token already exists" - Mint address collision (very rare)
- "Failed to store token data" - Backend/database issue

## Support

For issues or questions:
1. Check the console for detailed error messages
2. Verify all environment variables are set
3. Ensure all services (frontend, backend, database) are running
4. Check network connectivity and RPC endpoint status 