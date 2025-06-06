# 🚀 PumpFun - Solana Token Launchpad

A decentralized token creation and trading platform built on Solana, inspired by Pump.fun. Create meme coins with bonding curves, trade them, and graduate successful tokens to Raydium.

## ✨ Features

- **Free Token Creation**: Create SPL tokens with 1 billion supply (9 decimals)
- **Bonding Curve Trading**: 80% of supply available for trading with automated pricing
- **Token Burning**: 20% of supply automatically sent to burn wallet
- **Graduation System**: Tokens reaching $69K market cap graduate to Raydium
- **Real-time Verification**: Blockchain verification of all tokens
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind
- **Comprehensive Backend**: FastAPI backend with MongoDB for data persistence

## 🏗️ Architecture

### Frontend (Next.js)
- Token creation wizard with image upload
- Marketplace with filtering and search
- Real-time blockchain verification
- Wallet integration with @solana/wallet-adapter

### Backend (FastAPI + MongoDB)
- RESTful API for token management
- Image upload and processing
- Blockchain integration and verification
- Analytics and platform metrics

### Blockchain (Solana + Anchor)
- Custom Anchor program for token factory
- SPL token standard compliance
- Bonding curve mechanics
- Automated token distribution

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Radix UI
- **Backend**: FastAPI, MongoDB, Pydantic, Motor (async MongoDB driver)
- **Blockchain**: Solana, Anchor Framework, SPL Token Program
- **Infrastructure**: Docker support, environment-based configuration

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- Rust and Solana CLI tools
- Anchor Framework
- MongoDB (local or cloud)
- Solana wallet with some SOL for transactions

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd pumpfun
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
# - Add your admin wallet address
# - Set your MongoDB URI
# - Configure Solana RPC URL
```

### 3. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Start Local Solana Validator
```bash
solana-test-validator
```

### 5. Deploy Anchor Program
```bash
cd anchor
anchor build
anchor deploy
# Copy the program ID to your .env file
cd ..
```

### 6. Start Services
```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn app.main:app --reload --port 3001

# Terminal 2: Start frontend
npm run dev
```

### 7. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/docs

## 📖 Usage Guide

### Creating a Token
1. Connect your Solana wallet
2. Navigate to "Create Token"
3. Fill in token details (name, symbol, description)
4. Upload token image
5. Optionally add initial purchase amount
6. Sign the transaction to deploy on Solana

### Trading Tokens
1. Browse the marketplace
2. Click on any token to view details
3. Use the bonding curve to buy/sell tokens
4. Track your holdings in your wallet

### Token Graduation
- Tokens automatically become eligible for graduation at $69K market cap
- Graduation migrates liquidity to Raydium for traditional AMM trading
- Successful graduations generate platform fees

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ADMIN_WALLET_ADDRESS` | Admin wallet for token authority | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `TOKEN_FACTORY_PROGRAM_ID` | Deployed Anchor program ID | `CcAY4KNFQ2DmGFwzFUNLeLfZPsyWgJpdoS7C9c86KiCZ` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pumpfun` |

### Network Configuration

- **Development**: Use `solana-test-validator` for local testing
- **Devnet**: Set RPC to `https://api.devnet.solana.com`
- **Mainnet**: Set RPC to `https://api.mainnet-beta.solana.com`

## 📚 API Documentation

### Core Endpoints

- `POST /api/v1/tokens/create` - Create new token
- `GET /api/v1/tokens` - List tokens with pagination
- `GET /api/v1/tokens/{mint_address}` - Get token details
- `POST /api/v1/images/upload` - Upload token images
- `GET /api/v1/blockchain/verify/token/{mint_address}` - Verify token on-chain

Full API documentation available at `/docs` when running the backend.

## 🏭 Development

### Project Structure
```
pumpfun/
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── hooks/            # Custom React hooks
├── backend/               # FastAPI backend
│   └── app/              # Backend application
│       ├── routers/      # API route handlers
│       └── models.py     # Pydantic models
├── anchor/               # Solana program
│   └── programs/         # Anchor programs
│       └── token-factory/ # Token factory program
└── public/               # Static assets
```

### Development Commands
```bash
# Frontend development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint

# Backend development
cd backend
uvicorn app.main:app --reload  # Start with auto-reload

# Blockchain development
cd anchor
anchor build         # Build programs
anchor test          # Run tests
anchor deploy        # Deploy to configured cluster
```

## 🔒 Security Considerations

- Keep private keys secure and never commit them
- Use environment variables for all sensitive configuration
- Validate all user inputs on both frontend and backend
- Implement rate limiting for API endpoints
- Regular security audits of smart contracts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: Check the `/docs` directory
- Issues: Open a GitHub issue
- Community: Join our Discord (link here)

## 🙏 Acknowledgments

- Inspired by Pump.fun's innovative bonding curve model
- Built with the amazing Solana and Anchor ecosystems
- UI components from Radix UI and Tailwind CSS
