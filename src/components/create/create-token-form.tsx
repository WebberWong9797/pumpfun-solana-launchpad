'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, AlertCircle } from 'lucide-react'
import type { TokenFormData } from './create-token-feature'

interface CreateTokenFormProps {
  formData: TokenFormData
  setFormData: (data: TokenFormData) => void
  onNext: () => void
}

export function CreateTokenForm({ formData, setFormData, onNext }: CreateTokenFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required'
    } else if (formData.name.length > 32) {
      newErrors.name = 'Token name must be 32 characters or less'
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required'
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = 'Token symbol must be 10 characters or less'
    } else if (!/^[A-Z0-9]+$/.test(formData.symbol)) {
      newErrors.symbol = 'Token symbol must contain only uppercase letters and numbers'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Token description is required'
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    if (!formData.image) {
      newErrors.image = 'Token image is required'
    }

    if (formData.initialPurchase < 0) {
      newErrors.initialPurchase = 'Initial purchase amount cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please select a valid image file' })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image must be 5MB or smaller' })
      return
    }

    setFormData({ ...formData, image: file })
    setErrors({ ...errors, image: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Details</CardTitle>
        <CardDescription>
          Enter the basic information for your token
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Token Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., DogeCoin"
              maxLength={32}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/32 characters
            </p>
          </div>

          {/* Token Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Token Symbol *</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              placeholder="e.g., DOGE"
              maxLength={10}
              className={errors.symbol ? 'border-red-500' : ''}
            />
            {errors.symbol && (
              <p className="text-sm text-red-500">{errors.symbol}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.symbol.length}/10 characters (uppercase letters and numbers only)
            </p>
          </div>

          {/* Token Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your token and its purpose..."
              maxLength={500}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Token Image */}
          <div className="space-y-2">
            <Label>Token Image *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="space-y-4">
                  {formData.image ? (
                    <div className="space-y-2">
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Token preview"
                        className="w-24 h-24 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm font-medium">{formData.image.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">Upload Token Image</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image}</p>
            )}
          </div>

          {/* Initial Purchase */}
          <div className="space-y-2">
            <Label htmlFor="initialPurchase">Initial Purchase (SOL)</Label>
            <Input
              id="initialPurchase"
              type="number"
              value={formData.initialPurchase}
              onChange={(e) => setFormData({ ...formData, initialPurchase: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              step="0.1"
              className={errors.initialPurchase ? 'border-red-500' : ''}
            />
            {errors.initialPurchase && (
              <p className="text-sm text-red-500">{errors.initialPurchase}</p>
            )}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Optional: Buy tokens immediately after creation to prevent sniping.
                Recommended for fair launches.
              </AlertDescription>
            </Alert>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg">
            Continue to Review
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 