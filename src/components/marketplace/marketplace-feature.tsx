'use client'

import { useState } from 'react'
import { MarketplaceView } from './marketplace-ui'
import { useMarketplace } from '@/hooks/use-marketplace'

export function MarketplaceComponent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    creator: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  const [searchQuery, setSearchQuery] = useState('')

  const {
    tokens,
    isLoading,
    error,
    totalPages,
    totalCount,
    refetch
  } = useMarketplace({
    page: currentPage,
    pageSize: 20,
    ...filters
  })

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // TODO: Implement search functionality
  }

  return (
    <MarketplaceView
      tokens={tokens}
      isLoading={isLoading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      filters={filters}
      searchQuery={searchQuery}
      onPageChange={setCurrentPage}
      onFilterChange={handleFilterChange}
      onSearch={handleSearch}
      onRefresh={refetch}
    />
  )
} 