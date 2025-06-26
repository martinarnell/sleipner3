'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for the confirmation link!')
        // Note: With email confirmation, user won't be automatically signed in
        // They'll need to confirm their email first
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMagicLinkLoading(true)
    setError('')
    setMagicLinkSent(false)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          shouldCreateUser: true,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMagicLinkSent(true)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setMagicLinkLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                Click the link in your email to create your account and sign in. The link will expire in 1 hour.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => {
                setMagicLinkSent(false)
                setEmail('')
              }}
              variant="outline"
              className="w-full"
            >
              Back to sign up
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create your Sleipner account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Auth Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={authMode === 'password' ? 'default' : 'outline'}
              onClick={() => setAuthMode('password')}
              className="flex-1"
            >
              Password
            </Button>
            <Button
              type="button"
              variant={authMode === 'magic-link' ? 'default' : 'outline'}
              onClick={() => setAuthMode('magic-link')}
              className="flex-1"
            >
              Magic Link
            </Button>
          </div>

          {authMode === 'password' ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <Button
                type="submit"
                disabled={magicLinkLoading}
                className="w-full"
              >
                {magicLinkLoading ? 'Sending link...' : 'Send Magic Link'}
              </Button>

              <div className="text-sm text-muted-foreground text-center">
                We&apos;ll create your account and send you a secure link to sign in
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 