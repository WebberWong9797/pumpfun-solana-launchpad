'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/solana/solana-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateTokenForm } from './create-token-form'
import { CreateTokenPreview } from './create-token-preview'

export interface TokenFormData {
  name: string
  symbol: string
  description: string
  image: File | null
  initialPurchase: number
}

export function CreateTokenFeature() {
  const { connected } = useWallet()
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    image: null,
    initialPurchase: 0,
  })
  
  const [step, setStep] = useState<'form' | 'preview' | 'creating'>('form')

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Create Your Token</CardTitle>
              <CardDescription>
                Connect your wallet to create a new token on Solana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You need to connect your Solana wallet to create a token.
                </p>
                <WalletButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Create Your Token</h1>
          <p className="text-muted-foreground mt-2">
            Create your meme coin on Solana with 1B supply, no fees required
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'form' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              1
            </div>
            <span className={step === 'form' ? 'text-primary font-medium' : 'text-muted-foreground'}>
              Token Details
            </span>
            
            <div className="w-12 h-px bg-border"></div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'preview' || step === 'creating' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              2
            </div>
            <span className={step === 'preview' || step === 'creating' ? 'text-primary font-medium' : 'text-muted-foreground'}>
              Review & Create
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {step === 'form' ? (
              <CreateTokenForm
                formData={formData}
                setFormData={setFormData}
                onNext={() => setStep('preview')}
              />
            ) : (
              <CreateTokenPreview
                formData={formData}
                onBack={() => setStep('form')}
                onEdit={() => setStep('form')}
                isCreating={step === 'creating'}
                onCreateStart={() => setStep('creating')}
              />
            )}
          </div>
          
          <div>
            {/* Token Preview Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Token Preview</CardTitle>
                <CardDescription>
                  How your token will appear to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Token Image */}
                  <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {formData.image ? (
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Image</span>
                    )}
                  </div>
                  
                  {/* Token Info */}
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg">
                      {formData.name || 'Token Name'}
                    </h3>
                    <p className="text-muted-foreground font-mono">
                      ${formData.symbol || 'SYMBOL'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.description || 'Token description will appear here...'}
                    </p>
                  </div>

                  {/* Token Stats */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Supply:</span>
                      <span className="font-mono">1,000,000,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Decimals:</span>
                      <span className="font-mono">9</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Creation Fee:</span>
                      <span className="font-mono text-green-600">FREE</span>
                    </div>
                    {formData.initialPurchase > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Initial Purchase:</span>
                        <span className="font-mono">{formData.initialPurchase} SOL</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 