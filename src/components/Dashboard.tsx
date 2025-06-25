'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showNewKey, setShowNewKey] = useState(false)
  const [newKey, setNewKey] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApiKeys(data || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (!response.ok) throw new Error('Failed to create API key')

      const data = await response.json()
      setNewKey(data.key)
      setShowNewKey(true)
      setNewKeyName('')
      await fetchApiKeys()
    } catch (error) {
      console.error('Error creating API key:', error)
    } finally {
      setCreating(false)
    }
  }

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete API key')

      await fetchApiKeys()
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>

          {/* API Keys Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
              <p className="text-sm text-gray-600">
                Manage your API keys for accessing the model routing service
              </p>
            </div>

            <div className="p-6">
              {/* Create New Key */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="API key name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={createApiKey}
                    disabled={creating || !newKeyName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </div>

              {/* Show New Key Modal */}
              {showNewKey && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    API Key Created Successfully!
                  </h3>
                  <p className="text-sm text-green-700 mb-2">
                    Please copy this key now. You won't be able to see it again.
                  </p>
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono">
                      {newKey}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(newKey)}
                      className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Copy
                    </button>
                  </div>
                  <button
                    onClick={() => setShowNewKey(false)}
                    className="mt-2 text-sm text-green-600 hover:text-green-500"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* API Keys List */}
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No API keys yet. Create your first one above.
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-md"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{key.name}</h4>
                        <p className="text-sm text-gray-600">
                          Key: {key.key_prefix}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                          {key.last_used_at && (
                            <span>
                              {' • '}Last used: {new Date(key.last_used_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}