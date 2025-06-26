import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'
import { getUserApiKeys } from '@/lib/api-keys'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const apiKeys = await getUserApiKeys(user.id)

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Sleipner Dashboard</h1>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Welcome to Sleipner
              </CardTitle>
              <CardDescription>
                Your intelligent model routing API is ready to use. Generate an API key below to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">API Endpoint</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">
                    {process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/api/v1/chat/completions
                  </code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use this endpoint with your API key to make OpenAI-compatible requests.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <DashboardClient user={user} initialApiKeys={apiKeys} />
        </div>
      </main>
    </div>
  )
} 