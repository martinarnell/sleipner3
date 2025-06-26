import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from '@/lib/api-keys'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify the API key
    const { valid, userId } = await verifyApiKey(apiKey)
    if (!valid || !userId) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Get user information
    const supabase = await createClient()
    const { data: user, error } = await supabase.auth.admin.getUserById(userId)

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user information (without sensitive data)
    return NextResponse.json({
      user: {
        id: user.user.id,
        email: user.user.email,
        created_at: user.user.created_at,
        email_confirmed_at: user.user.email_confirmed_at,
      },
      api_key_info: {
        verified: true,
        key_prefix: apiKey.substring(0, 7) + '••••••••••••••••'
      }
    })
  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 