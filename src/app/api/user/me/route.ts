import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashApiKey, validateApiKeyFormat } from '@/lib/api-keys'

export async function GET(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const apiKey = authHeader.replace('Bearer ', '')

    // Validate API key format
    if (!validateApiKeyFormat(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 })
    }

    // Hash the API key for database lookup
    const keyHash = hashApiKey(apiKey)

    const supabase = createClient()

    // Find the API key in the database
    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select(`
        id,
        name,
        user_id,
        is_active,
        auth.users!inner(
          id,
          email,
          created_at
        )
      `)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyError || !apiKeyData) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Update last_used_at timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id)

    // Return user information
    const userData = apiKeyData.users
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
      },
      api_key: {
        id: apiKeyData.id,
        name: apiKeyData.name,
      },
    })
  } catch (error) {
    console.error('Error in user/me endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}