import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  
  const response = NextResponse.redirect(new URL('/', req.url), {
    status: 302,
  })

  // Manually clear the auth cookie
  response.cookies.set('supabase-auth-token', '', {
    expires: new Date(0),
    path: '/',
  })
  
  return response
} 