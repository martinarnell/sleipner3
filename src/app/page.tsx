import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              ⚡ Intelligent AI Routing
            </Badge>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
              Sleipner
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Intelligent model routing for cost-effective AI API calls
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Route your AI requests through smaller models first, then scale up as needed. 
              Reduce costs while maintaining quality with our smart routing system.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center mb-16">
            <Button asChild size="lg" className="px-8">
              <Link href="/auth/signup">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <CardTitle>Sign Up & Get API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create your account and generate a secure API key for authentication
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <CardTitle>Send Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use our OpenAI-compatible API to send your chat completion requests
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <CardTitle>Save Money</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our intelligent routing saves you money by using optimal models
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 