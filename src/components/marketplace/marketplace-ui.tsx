'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, RefreshCw, ExternalLink, TrendingUp, Users, Activity } from 'lucide-react'
import { Token } from '@/hooks/use-marketplace'

interface MarketplaceViewProps {
  tokens: Token[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalCount: number
  filters: {
    status: string
    creator: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  searchQuery: string
  onPageChange: (page: number) => void
  onFilterChange: (filters: Partial<{
    status: string
    creator: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }>) => void
  onSearch: (query: string) => void
  onRefresh: () => void
}

export function MarketplaceView({
  tokens,
  isLoading,
  error,
  currentPage,
  totalPages,
  totalCount,
  filters,
  searchQuery,
  onPageChange,
  onFilterChange,
  onSearch,
  onRefresh,
}: MarketplaceViewProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearchQuery)
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}K`
    return `$${marketCap.toFixed(2)}`
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A'
    return `$${price.toFixed(6)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graduated': return 'bg-green-500'
      case 'eligible': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'graduated': return 'Graduated'
      case 'eligible': return 'Eligible'
      case 'pending': return 'Pending'
      case 'failed': return 'Failed'
      default: return status
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Token Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and trade the latest tokens on PumpFun
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Trading</p>
              <p className="text-2xl font-bold">{tokens.filter(t => t.current_price).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Graduated</p>
              <p className="text-2xl font-bold">{tokens.filter(t => t.graduation_status === 'graduated').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tokens by name, symbol, or creator..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex gap-2">
              <Select
                value={filters.status}
                onValueChange={(value: string) => onFilterChange({ status: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value: string) => onFilterChange({ sortBy: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created</SelectItem>
                  <SelectItem value="market_cap">Market Cap</SelectItem>
                  <SelectItem value="total_volume">Volume</SelectItem>
                  <SelectItem value="holder_count">Holders</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortOrder}
                onValueChange={(value: string) => onFilterChange({ sortOrder: value as 'asc' | 'desc' })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading tokens...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <p className="text-lg font-semibold">Error loading tokens</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={onRefresh} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Grid */}
      {!isLoading && !error && (
        <>
          {tokens.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-lg text-muted-foreground">No tokens found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or create a new token
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tokens.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <Button
                      key={page}
                      onClick={() => onPageChange(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TokenCard({ token }: { token: Token }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}K`
    return `$${marketCap.toFixed(2)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graduated': return 'bg-green-500'
      case 'eligible': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'graduated': return 'Graduated'
      case 'eligible': return 'Eligible'
      case 'pending': return 'Pending'
      case 'failed': return 'Failed'
      default: return status
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={token.image_uri}
              alt={token.name}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/48x48?text=' + token.symbol
              }}
            />
            <div>
              <CardTitle className="text-lg">{token.name}</CardTitle>
              <p className="text-sm text-muted-foreground">${token.symbol}</p>
            </div>
          </div>
          <Badge className={getStatusColor(token.graduation_status)}>
            {getStatusText(token.graduation_status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {token.description}
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-semibold">{formatMarketCap(token.market_cap)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-semibold">
                {token.current_price ? `$${token.current_price.toFixed(6)}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Holders</p>
              <p className="font-semibold">{token.holder_count || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Transactions</p>
              <p className="font-semibold">{token.transactions_count || 0}</p>
            </div>
          </div>

          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">Created {formatDate(token.created_at)}</p>
            
            <div className="flex gap-2 mt-2">
              {token.solana_explorer_url && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(token.solana_explorer_url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Explorer
                </Button>
              )}
              <Button size="sm" className="flex-1">
                Trade
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 