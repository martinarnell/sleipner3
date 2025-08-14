'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Plus, Key, Copy, Trash2, Code, Terminal, Check, Play, Menu, Home } from 'lucide-react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface User {
  id: string
  email?: string
}

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

interface DashboardLayoutProps {
  user: User
  apiKeys: ApiKey[]
}

function ApiKeyManagement({ apiKeys: initialApiKeys }: { apiKeys: ApiKey[] }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys)
  const [newKeyName, setNewKeyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newKey, setNewKey] = useState('')

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (!response.ok) {
        throw new Error('Failed to create API key')
      }

      const data = await response.json()
      setNewKey(data.key)
      setApiKeys([data, ...apiKeys])
      setNewKeyName('')
    } catch {
      setError('Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete API key')
      }

      setApiKeys(apiKeys.filter(key => key.id !== keyId))
    } catch {
      setError('Failed to delete API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* New API Key Display */}
      {newKey && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 API Key Created!</h3>
                <p className="text-green-700">
                  Copy this key now - you won&apos;t be able to see it again.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-green-100 text-green-800 p-3 rounded text-sm font-mono break-all">
                  {newKey}
                </code>
                <Button
                  onClick={() => copyToClipboard(newKey)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => setNewKey('')}
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800"
              >
                Got it, hide this key
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Create New API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create API Key
          </CardTitle>
          <CardDescription>
            Generate a new API key for authentication with Sleipner services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={createApiKey} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="API key name (e.g., 'Production', 'Development')"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Key'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your existing API keys. You can delete keys you no longer need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No API keys created yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first API key above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <Card key={key.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{key.name}</h4>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {key.key_prefix}••••••••••••••••
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used_at && (
                          <span> • Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={() => deleteApiKey(key.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GetStartedSection({ apiKeys }: { apiKeys: ApiKey[] }) {
  const [copiedExample, setCopiedExample] = useState<string | null>(null)
  const [selectedExample, setSelectedExample] = useState<'curl' | 'python' | 'javascript'>('curl')
  
  const copyExample = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedExample(id)
    setTimeout(() => setCopiedExample(null), 2000)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://api.sleipner.com'

  const curlExample = `curl -X POST "${baseUrl}/api/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "What is machine learning?"
      }
    ]
  }'`

  const pythonExample = `import requests

url = "${baseUrl}/api/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}

data = {
    "model": "gpt-4",
    "messages": [
        {
            "role": "user", 
            "content": "What is machine learning?"
        }
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`

  const jsExample = `const response = await fetch("${baseUrl}/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: "What is machine learning?"
      }
    ]
  })
});

const data = await response.json();
console.log(data);`

  return (
    <div className="space-y-8">
      {/* Quick Start */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Get Started</h2>
        
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">API Endpoint</h4>
                <div className="flex items-center justify-between bg-muted p-3 rounded">
                  <code className="text-sm font-mono">
                    {baseUrl}/api/v1/chat/completions
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyExample('endpoint', `${baseUrl}/api/v1/chat/completions`)}
                  >
                    {copiedExample === 'endpoint' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Model Selection</h4>
                <p className="text-sm text-muted-foreground">
                  Your specified model (e.g., &quot;gpt-4&quot;) acts as the <strong>maximum tier</strong>. 
                  Sleipner tries free alternatives first, then escalates if needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>

        <div className="mb-6">
          <h4 className="font-semibold mb-3">Request Headers</h4>
          <div className="space-y-2 text-sm">
            <div className="bg-muted p-2 rounded">
              <code>Authorization: Bearer YOUR_API_KEY</code> <span className="text-muted-foreground">(required)</span>
            </div>
            <div className="bg-muted p-2 rounded">
              <code>&quot;model&quot;: &quot;gpt-4&quot;</code> <span className="text-muted-foreground">(sets max tier)</span>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedExample === 'curl' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedExample('curl')}
              className="flex items-center gap-2"
            >
              <Terminal className="h-4 w-4" />
              cURL
            </Button>
            <Button
              variant={selectedExample === 'python' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedExample('python')}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
              Python
            </Button>
            <Button
              variant={selectedExample === 'javascript' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedExample('javascript')}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
              JavaScript
            </Button>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Request Example</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyExample('example', selectedExample === 'curl' ? curlExample : selectedExample === 'python' ? pythonExample : jsExample)}
              >
                {copiedExample === 'example' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{selectedExample === 'curl' ? curlExample : selectedExample === 'python' ? pythonExample : jsExample}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Key Management */}
      <div>
        <h2 className="text-2xl font-bold mb-4">API Key Management</h2>
        <ApiKeyManagement apiKeys={apiKeys} />
      </div>
    </div>
  )
}

function NavigationSidebar({ currentPath, user }: { currentPath: string, user: { email?: string } }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b">
        <h2 className="text-lg font-semibold">Sleipner</h2>
        <Badge variant="secondary">Beta</Badge>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPath === '/dashboard' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          
          <Link
            href="/dashboard/playground"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPath === '/dashboard/playground' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Play className="h-4 w-4" />
            Playground
          </Link>
        </div>
      </nav>
      
      {/* User Section */}
      <div className="border-t p-4">
        <div className="space-y-3">
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-foreground">Account</div>
            <div className="text-xs text-muted-foreground truncate">{user.email || 'No email'}</div>
          </div>
          
          <form action="/auth/signout" method="post" className="w-full">
            <Button variant="outline" size="sm" type="submit" className="w-full justify-start">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ user, apiKeys }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow border-r bg-card">
            <NavigationSidebar currentPath="/dashboard" user={user} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <NavigationSidebar currentPath="/dashboard" user={user} />
          </SheetContent>
          
          {/* Main Content */}
          <div className="flex flex-col flex-1 lg:ml-64">
            {/* Header */}
            <nav className="border-b bg-card">
              <div className="px-4 py-4">
                <div className="flex items-center">
                  {/* Mobile menu button and title */}
                  <div className="flex items-center gap-4">
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="lg:hidden">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <div className="flex items-center gap-3 lg:hidden">
                      <h1 className="text-xl font-bold">Dashboard</h1>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                  <GetStartedSection apiKeys={apiKeys} />
                </div>
              </div>
            </main>
            </div>
        </Sheet>
      </div>
    </div>
  )
}