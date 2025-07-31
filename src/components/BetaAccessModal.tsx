'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, Mail } from 'lucide-react'

interface BetaAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  email: string
  company: string
  aiService: string
  monthlySpend: string
  website: string // honeypot
}

interface FormErrors {
  email?: string
  company?: string
  aiService?: string
  monthlySpend?: string
  general?: string
}

export function BetaAccessModal({ open, onOpenChange }: BetaAccessModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    company: '',
    aiService: '',
    monthlySpend: '',
    website: '' // honeypot field
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.aiService) {
      newErrors.aiService = 'Please select your current AI service'
    }

    if (!formData.monthlySpend) {
      newErrors.monthlySpend = 'Please select your monthly AI spend range'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Check honeypot
    if (formData.website) {
      setErrors({ general: 'Submission failed. Please try again.' })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Get UTM parameters from URL for source tracking
      const urlParams = new URLSearchParams(window.location.search)
      const source = [
        urlParams.get('utm_source'),
        urlParams.get('utm_medium'),
        urlParams.get('utm_campaign')
      ].filter(Boolean).join(' | ') || 'direct'

      const response = await fetch('/api/beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          company: formData.company || null,
          aiService: formData.aiService,
          monthlySpend: formData.monthlySpend,
          source
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setErrors({ general: 'Too many requests. Please try again later.' })
        } else if (response.status === 400) {
          setErrors({ general: data.error || 'Invalid submission. Please check your details.' })
        } else if (response.status === 409) {
          setErrors({ general: 'This email is already on our waitlist!' })
        } else {
          setErrors({ general: 'Something went wrong. Please try again.' })
        }
        return
      }

      setIsSuccess(true)
      
      // Track analytics if available
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).analytics) {
        ((window as unknown as Record<string, unknown>).analytics as { track: (event: string, data: Record<string, string>) => void }).track('beta_signup', {
          email: formData.email,
          company: formData.company,
          aiService: formData.aiService,
          monthlySpend: formData.monthlySpend,
          source
        })
      }

    } catch (error) {
      console.error('Beta signup error:', error)
      setErrors({ general: 'Network error. Please check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      // Reset form after close animation
      setTimeout(() => {
        setFormData({ email: '', company: '', aiService: '', monthlySpend: '', website: '' })
        setErrors({})
        setIsSuccess(false)
      }, 200)
    }
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border border-primary/20 shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
            {isSuccess ? 'Welcome to the Beta!' : 'Join Sleipner Beta'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isSuccess 
              ? "We'll be in touch soon with your access details."
              : "Be among the first to save 75% on AI costs with zero engineering effort."
            }
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">You&apos;re on the waitlist!</p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Check your inbox for confirmation
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Work Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@company.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isSubmitting}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                type="text"
                placeholder="Acme Corp"
                value={formData.company}
                onChange={handleInputChange('company')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiService">Current AI Service *</Label>
              <select
                id="aiService"
                value={formData.aiService}
                onChange={handleInputChange('aiService')}
                disabled={isSubmitting}
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                  errors.aiService ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              >
                <option value="">Select your AI service...</option>
                <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="google">Google (Gemini)</option>
                <option value="openRouter">OpenRouter</option>
                <option value="multiple">Multiple providers</option>
                <option value="other">Other</option>
              </select>
              {errors.aiService && (
                <p className="text-sm text-red-500">{errors.aiService}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlySpend">Monthly AI Spend *</Label>
              <select
                id="monthlySpend"
                value={formData.monthlySpend}
                onChange={handleInputChange('monthlySpend')}
                disabled={isSubmitting}
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                  errors.monthlySpend ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              >
                <option value="">Select your monthly spend...</option>
                <option value="1000_5000">$1,000 - $5,000</option>
                <option value="5000_10000">$5,000 - $10,000</option>
                <option value="10000_25000">$10,000 - $25,000</option>
                <option value="25000_50000">$25,000 - $50,000</option>
                <option value="50000_plus">$50,000+</option>
                <option value="not_sure">Not sure</option>
              </select>
              {errors.monthlySpend && (
                <p className="text-sm text-red-500">{errors.monthlySpend}</p>
              )}
            </div>

            {/* Honeypot field - hidden from users */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange('website')}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Beta'
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By joining, you agree to receive product updates via email.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}