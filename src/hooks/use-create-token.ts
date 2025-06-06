'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Keypair, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToInstruction, createTransferInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE } from '@solana/spl-token'

interface CreateTokenParams {
  name: string
  symbol: string
  description: string
  image: File
  creatorWallet: string
  initialPurchaseAmount?: number
}

// Token Factory Program ID from deployment
const TOKEN_FACTORY_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_FACTORY_PROGRAM_ID || 'CcAY4KNFQ2DmGFwzFUNLeLfZPsyWgJpdoS7C9c86KiCZ')
const ADMIN_WALLET = new PublicKey(process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const BURNING_WALLET = new PublicKey(process.env.ADMIN_BURNING_WALLET_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

export function useCreateToken() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [mintAddress, setMintAddress] = useState<string | null>(null)

  const createToken = async (params: CreateTokenParams) => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Step 1: Upload image to backend
      const formData = new FormData()
      formData.append('file', params.image)

      const imageResponse = await fetch('http://localhost:3001/api/v1/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (!imageResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const imageData = await imageResponse.json()
      const imageUri = imageData.uri

      // Step 2: Generate mint keypair
      const mintKeypair = Keypair.generate()
      const mint = mintKeypair.publicKey

      // Step 3: Create a basic SPL token for now (simplified approach)
      // This creates a standard SPL token that can be verified on-chain
      
      const lamports = await getMinimumBalanceForRentExemptMint(connection)
      
      const transaction = new Transaction()
      
      // Create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        })
      )
      
      // Initialize mint
      transaction.add(
        createInitializeMintInstruction(
          mint,
          9, // decimals
          ADMIN_WALLET, // mint authority
          ADMIN_WALLET, // freeze authority
          TOKEN_PROGRAM_ID
        )
      )

      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Sign with mint keypair
      transaction.partialSign(mintKeypair)

      // Sign with user wallet
      const signedTransaction = await signTransaction(transaction)
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed')

      console.log('Token created successfully:', mint.toString())
      console.log('Transaction signature:', signature)

      // Step 4: Store token data in backend
      const tokenData = {
        mint_address: mint.toString(),
        creator_wallet: params.creatorWallet,
        name: params.name,
        symbol: params.symbol,
        description: params.description,
        image_uri: imageUri,
        initial_purchase_amount: params.initialPurchaseAmount,
      }

      const tokenResponse = await fetch('http://localhost:3001/api/v1/tokens/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to store token data')
      }

      setMintAddress(mint.toString())
      setSuccess(true)

    } catch (err) {
      console.error('Token creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create token')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createToken,
    isLoading,
    error,
    success,
    mintAddress,
  }
} 