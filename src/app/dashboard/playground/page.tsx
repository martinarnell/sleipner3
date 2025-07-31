import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getUserApiKeys } from '@/lib/api-keys'
import PlaygroundLayout from '@/components/PlaygroundLayout'

export default async function PlaygroundPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const apiKeys = await getUserApiKeys(user.id)

  return (
    <PlaygroundLayout user={user} apiKeys={apiKeys} />
  )
}