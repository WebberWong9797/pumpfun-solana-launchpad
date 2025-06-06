'use client'

import { useState, useEffect } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

interface Token {
  id: string
  mint_address: string
  creator_wallet: string
  name: string
  symbol: string
  description: string
  image_uri: string
  total_supply: number
  decimals: number
  current_price?: number
  market_cap?: number
  total_volume?: number
  holder_count?: number
  transactions_count?: number
  graduation_status: 'pending' | 'eligible' | 'graduated' | 'failed'
  graduation_threshold: number
  graduation_date?: string
  solana_explorer_url?: string
  solscan_url?: string
  contract_verified: boolean
  last_verified?: string
  created_at: string
  updated_at?: string
  is_active: boolean
  tags: string[]
  // Blockchain verification data
  on_chain_verified?: boolean
  mint_authority?: string
  freeze_authority?: string
  supply?: number
}

interface MarketplaceFilters {
  page: number
  pageSize: number
  status?: string
  creator?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface MarketplaceResponse {
  tokens: Token[]
  total_count: number
  page: number
  page_size: number
  total_pages: number
}

export function useMarketplace(filters: MarketplaceFilters) {
  const { connection } = useConnection()
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const verifyTokenOnChain = async (mintAddress: string): Promise<Partial<Token>> => {
    try {
      const mintPubkey = new PublicKey(mintAddress)
      const accountInfo = await connection.getAccountInfo(mintPubkey)
      
      if (!accountInfo) {
        return { on_chain_verified: false }
      }

      // Parse mint account data (simplified)
      const data = accountInfo.data
      if (data.length >= 82) { // Standard mint account size
        return {
          on_chain_verified: true,
          supply: Number(data.readBigUInt64LE(36)), // Supply is at offset 36
          // Note: For full parsing, we'd need to decode the mint account properly
        }
      }

      return { on_chain_verified: true }
    } catch (error) {
      console.error('Error verifying token on chain:', error)
      return { on_chain_verified: false }
    }
  }

  const fetchTokens = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('page', filters.page.toString())
      params.append('page_size', filters.pageSize.toString())
      
      if (filters.status) params.append('status', filters.status)
      if (filters.creator) params.append('creator', filters.creator)
      if (filters.sortBy) params.append('sort_by', filters.sortBy)
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder)

      const response = await fetch(`http://localhost:3001/api/v1/tokens?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tokens')
      }

      const data: MarketplaceResponse = await response.json()
      
      // Verify tokens on-chain (for the first few to avoid rate limiting)
      const tokensWithVerification = await Promise.all(
        data.tokens.slice(0, 5).map(async (token) => {
          const verification = await verifyTokenOnChain(token.mint_address)
          return { ...token, ...verification }
        })
      )

      // Add remaining tokens without verification for now
      const allTokens = [
        ...tokensWithVerification,
        ...data.tokens.slice(5).map(token => ({ ...token, on_chain_verified: undefined }))
      ]
      
      setTokens(allTokens)
      setTotalPages(data.total_pages)
      setTotalCount(data.total_count)
    } catch (err) {
      console.error('Marketplace fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const verifySpecificToken = async (mintAddress: string) => {
    try {
      const verification = await verifyTokenOnChain(mintAddress)
      
      // Update the token in the list
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.mint_address === mintAddress 
            ? { ...token, ...verification }
            : token
        )
      )

      // Also update the backend
      await fetch(`http://localhost:3001/api/v1/blockchain/sync/token/${mintAddress}`, {
        method: 'POST'
      })

      return verification
    } catch (error) {
      console.error('Error verifying specific token:', error)
      return { on_chain_verified: false }
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [filters.page, filters.pageSize, filters.status, filters.creator, filters.sortBy, filters.sortOrder])

  return {
    tokens,
    isLoading,
    error,
    totalPages,
    totalCount,
    refetch: fetchTokens,
    verifyToken: verifySpecificToken,
  }
}

export type { Token, MarketplaceFilters } 