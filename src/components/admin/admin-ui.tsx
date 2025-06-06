'use client'

import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { RefreshCw, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { ExplorerLink } from '../cluster/cluster-ui'
import {
  useGetBalance,
  useGetSignatures,
  useGetTokenAccounts,
} from '../account/account-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Read-only version of AccountBalance for admin dashboard
export function AdminWalletBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address })

  return (
    <div className="flex items-center space-x-2">
      <h1 className="text-5xl font-bold cursor-pointer" onClick={() => query.refetch()}>
        {query.data ? <BalanceSol balance={query.data} /> : '...'} SOL
      </h1>
      {query.isLoading && <RefreshCw className="h-6 w-6 animate-spin" />}
    </div>
  )
}

// Read-only version of AccountTokens for admin dashboard (no buttons)
export function AdminWalletTokens({ address }: { address: PublicKey }) {
  const [showAll, setShowAll] = useState(false)
  const query = useGetTokenAccounts({ address })
  const client = useQueryClient()
  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 10)
  }, [query.data, showAll])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Admin Token Holdings</CardTitle>
            <CardDescription>
              Read-only view of tokens held in admin wallet
            </CardDescription>
          </div>
          <div className="space-x-2">
            {query.isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Button
                variant="outline"
                onClick={async () => {
                  await query.refetch()
                  await client.invalidateQueries({
                    queryKey: ['getTokenAccountBalance'],
                  })
                }}
              >
                <RefreshCw size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {query.isError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            Error: {query.error?.message.toString()}
          </div>
        )}
        {query.isSuccess && (
          <div>
            {query.data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No token accounts found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Public Key</TableHead>
                    <TableHead>Mint</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map(({ account, pubkey }) => (
                    <TableRow key={pubkey.toString()}>
                      <TableCell>
                        <div className="flex space-x-2">
                          <span className="font-mono">
                            <ExplorerLink label={ellipsify(pubkey.toString())} path={`account/${pubkey.toString()}`} />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <span className="font-mono">
                            <ExplorerLink
                              label={ellipsify(account.data.parsed.info.mint)}
                              path={`account/${account.data.parsed.info.mint.toString()}`}
                            />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono">{account.data.parsed.info.tokenAmount.uiAmount}</span>
                      </TableCell>
                    </TableRow>
                  ))}

                  {(query.data?.length ?? 0) > 10 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                          {showAll ? 'Show Less' : 'Show All'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Read-only version of AccountTransactions for admin dashboard
export function AdminWalletTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address })
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 10)
  }, [query.data, showAll])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Admin Transaction History</CardTitle>
            <CardDescription>
              Read-only view of transactions from admin wallet
            </CardDescription>
          </div>
          <div className="space-x-2">
            {query.isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Button variant="outline" onClick={() => query.refetch()}>
                <RefreshCw size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {query.isError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            Error: {query.error?.message.toString()}
          </div>
        )}
        {query.isSuccess && (
          <div>
            {query.data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Signature</TableHead>
                    <TableHead className="text-right">Slot</TableHead>
                    <TableHead>Block Time</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((item) => (
                    <TableRow key={item.signature}>
                      <TableCell className="font-mono">
                        <ExplorerLink path={`tx/${item.signature}`} label={ellipsify(item.signature, 8)} />
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        <ExplorerLink path={`block/${item.slot}`} label={item.slot.toString()} />
                      </TableCell>
                      <TableCell>{new Date((item.blockTime ?? 0) * 1000).toISOString()}</TableCell>
                      <TableCell className="text-right">
                        {item.err ? (
                          <span className="text-red-500" title={item.err.toString()}>
                            Failed
                          </span>
                        ) : (
                          <span className="text-green-500">Success</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(query.data?.length ?? 0) > 10 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                          {showAll ? 'Show Less' : 'Show All'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Platform analytics component for admin dashboard
export function AdminAnalytics() {
  const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME || 'PumpFun'
  const graduationThreshold = process.env.NEXT_PUBLIC_GRADUATION_THRESHOLD || 69000

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>
            Overview of {platformName} platform performance and token statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Total Tokens Created</p>
                <p className="text-2xl font-bold text-blue-600">-</p>
                <p className="text-xs text-blue-700">Data not connected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Active Traders</p>
                <p className="text-2xl font-bold text-green-600">-</p>
                <p className="text-xs text-green-700">Data not connected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Graduated Tokens</p>
                <p className="text-2xl font-bold text-purple-600">-</p>
                <p className="text-xs text-purple-700">Reached ${graduationThreshold.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
              <Activity className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Trading Volume</p>
                <p className="text-2xl font-bold text-orange-600">-</p>
                <p className="text-xs text-orange-700">Data not connected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Platform configuration and system information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Platform Name:</span>
              <span className="text-sm">{platformName}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Graduation Threshold:</span>
              <span className="text-sm">${graduationThreshold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Admin Dashboard Status:</span>
              <span className="text-sm text-green-600">✓ Operational</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Database Connection:</span>
              <span className="text-sm text-yellow-600">⚠ Not Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Environment configuration for admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Admin Wallet Configured:</span>
              <span className="text-sm text-green-600">
                {process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Dashboard Enabled:</span>
              <span className="text-sm text-green-600">
                {process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_ENABLED === 'true' ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BalanceSol({ balance }: { balance: number }) {
  return <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
} 