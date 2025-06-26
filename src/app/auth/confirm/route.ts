import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase.auth.verifyOtp({
        type: type as 'email',
        token_hash,
      })

      if (!error && data.user) {
        // Redirect to the dashboard or specified page
        const redirectUrl = new URL(next, request.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (err) {
      console.error('Auth confirmation error:', err)
    }
  }

  // If there's an error, redirect to sign-in with error message
  const redirectUrl = new URL('/auth/signin', request.url)
  redirectUrl.searchParams.set('error', 'Invalid or expired link')
  return NextResponse.redirect(redirectUrl)
} 