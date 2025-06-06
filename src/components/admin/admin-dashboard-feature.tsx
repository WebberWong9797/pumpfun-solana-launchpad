'use client'

import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { AdminWalletBalance, AdminWalletTokens, AdminWalletTransactions, AdminAnalytics } from './admin-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminDashboardFeature() {
  const adminWalletAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
  const dashboardTitle = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_TITLE || 'Admin Dashboard'
  const adminWalletLabel = process.env.NEXT_PUBLIC_ADMIN_WALLET_LABEL || 'Admin Wallet'

  const address = useMemo(() => {
    if (!adminWalletAddress) {
      return null
    }
    try {
      return new PublicKey(adminWalletAddress)
    } catch (e) {
      console.log(`Invalid admin wallet address`, e)
      return null
    }
  }, [adminWalletAddress])

  if (!address) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Configuration Error</CardTitle>
            <CardDescription>
              Admin wallet address not configured. Please set NEXT_PUBLIC_ADMIN_WALLET_ADDRESS in your environment file.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <AppHero
        title={<AdminWalletBalance address={address} />}
        subtitle={
          <div className="my-4 space-y-2">
            <div className="text-lg font-medium">{adminWalletLabel}</div>
            <ExplorerLink path={`account/${address}`} label={ellipsify(address.toString())} />
            <div className="text-sm text-muted-foreground">
              Read-only monitoring interface - No wallet connection required
            </div>
          </div>
        }
      >
        <div className="text-center text-sm text-muted-foreground mt-4">
          {dashboardTitle}
        </div>
      </AppHero>

      <div className="mt-8">
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wallet">Wallet Overview</TabsTrigger>
            <TabsTrigger value="tokens">Token Holdings</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-6 mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Wallet Information</CardTitle>
                  <CardDescription>
                    Display-only view of admin wallet balance and basic information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span className="font-medium">Wallet Address:</span>
                      <span className="font-mono text-sm">
                        <ExplorerLink path={`account/${address}`} label={address.toString()} />
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span className="font-medium">Current Balance:</span>
                      <AdminWalletBalance address={address} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-6 mt-6">
            <AdminWalletTokens address={address} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6 mt-6">
            <AdminWalletTransactions address={address} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 