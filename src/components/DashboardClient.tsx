'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Copy, Trash2, Plus } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

interface DashboardClientProps {
  user: User
  initialApiKeys: ApiKey[]
}

export default function DashboardClient({ initialApiKeys }: DashboardClientProps) {
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
            Create New API Key
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

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            Example of how to use your API key with the Sleipner API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 relative">
            <Button
              onClick={() => copyToClipboard(`curl -X POST "${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/api/v1/chat/completions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ]
  }'`)}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <pre className="text-sm overflow-x-auto pr-12">
{`curl -X POST "${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/api/v1/chat/completions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ]
  }'`}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY</code> with one of your generated API keys.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 