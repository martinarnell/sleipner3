import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createApiKey } from '@/lib/api-keys'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    const apiKey = await createApiKey(user.id, name.trim())

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
} 