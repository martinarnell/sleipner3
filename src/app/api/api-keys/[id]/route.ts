import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { deleteApiKey } from '@/lib/api-keys'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteApiKey(user.id, resolvedParams.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
} 




// slp_9b50254bf5773c3acdf4e380bebf95623d20ef002e8d00e04b9f11c15436ae34

