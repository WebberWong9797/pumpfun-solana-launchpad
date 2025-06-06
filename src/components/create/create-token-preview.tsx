'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, Edit } from 'lucide-react'
import type { TokenFormData } from './create-token-feature'
import { useCreateToken } from '@/hooks/use-create-token'

interface CreateTokenPreviewProps {
  formData: TokenFormData
  onBack: () => void
  onEdit: () => void
  isCreating: boolean
  onCreateStart: () => void
}

export function CreateTokenPreview({ 
  formData, 
  onBack, 
  onEdit, 
  isCreating, 
  onCreateStart 
}: CreateTokenPreviewProps) {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { createToken, isLoading, error, success, mintAddress } = useCreateToken()
  const [step, setStep] = useState<'ready' | 'uploading' | 'creating' | 'success' | 'error'>('ready')

  const handleCreate = async () => {
    if (!publicKey || !formData.image) return
    
    onCreateStart()
    setStep('uploading')
    
    try {
      await createToken({
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.image,
        creatorWallet: publicKey.toString(),
        initialPurchaseAmount: formData.initialPurchase > 0 ? Math.floor(formData.initialPurchase * 1e9) : undefined // Convert SOL to lamports
      })
      
      setStep('success')
    } catch (err) {
      setStep('error')
    }
  }

  if (step === 'success' && mintAddress) {
    return (
      <Card>
        <CardHeader>
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <div>
              <CardTitle className="text-2xl text-green-600">Token Created Successfully!</CardTitle>
              <CardDescription>
                Your token has been deployed to the Solana blockchain
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Token Name:</span>
              <span>{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Symbol:</span>
              <span className="font-mono">${formData.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Contract Address:</span>
              <span className="font-mono text-sm">{mintAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Supply:</span>
              <span className="font-mono">1,000,000,000</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={() => window.open(`https://explorer.solana.com/address/${mintAddress}`, '_blank')}
            >
              View on Solana Explorer
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(`/token/${mintAddress}`, '_self')}
            >
              View Token Page
            </Button>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your token is now live and available for trading on our bonding curve!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={onBack} />
          Review & Create Token
        </CardTitle>
        <CardDescription>
          Review your token details before deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            {formData.image && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt={formData.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{formData.name}</h3>
              <p className="text-muted-foreground font-mono">${formData.symbol}</p>
              <Badge variant="secondary" className="mt-1">
                1B Total Supply
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{formData.description}</p>
          </div>
        </div>

        {/* Token Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Token Configuration</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Network</span>
              <p className="font-mono">Solana</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Standard</span>
              <p className="font-mono">SPL Token</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Total Supply</span>
              <p className="font-mono">1,000,000,000</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Decimals</span>
              <p className="font-mono">9</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Bonding Curve</span>
              <p className="font-mono">80% (800M)</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Burning Reserve</span>
              <p className="font-mono">20% (200M)</p>
            </div>
          </div>
        </div>

        {/* Fees & Costs */}
        <div className="space-y-4">
          <h4 className="font-medium">Creation Costs</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span>Token Creation Fee</span>
              <span className="font-mono text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Network Fee (Est.)</span>
              <span className="font-mono">~0.005 SOL</span>
            </div>
            {formData.initialPurchase > 0 && (
              <div className="flex justify-between items-center mt-2">
                <span>Initial Purchase</span>
                <span className="font-mono">{formData.initialPurchase} SOL</span>
              </div>
            )}
          </div>
        </div>

        {/* Creation Status */}
        {step !== 'ready' && (
          <Alert>
            {step === 'uploading' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Uploading image and preparing token data...</AlertDescription>
              </>
            )}
            {step === 'creating' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Creating token on Solana blockchain...</AlertDescription>
              </>
            )}
            {step === 'error' && (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-600">
                  {error || 'Failed to create token. Please try again.'}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1" disabled={isCreating}>
            Back to Edit
          </Button>
          <Button 
            onClick={handleCreate} 
            className="flex-2" 
            disabled={isCreating || !publicKey}
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Token...
              </>
            ) : (
              'Create Token'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 