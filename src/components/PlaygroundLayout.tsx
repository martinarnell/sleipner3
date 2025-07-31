'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Home, Menu } from 'lucide-react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import ChatPlayground from '@/components/ChatPlayground'

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

interface PlaygroundLayoutProps {
  user: User
  apiKeys: ApiKey[]
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

export default function PlaygroundLayout({ user, apiKeys }: PlaygroundLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow border-r bg-card">
            <NavigationSidebar currentPath="/dashboard/playground" user={user} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <NavigationSidebar currentPath="/dashboard/playground" user={user} />
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
                      <h1 className="text-xl font-bold">Playground</h1>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-6xl mx-auto">
                <ChatPlayground apiKeys={apiKeys} />
              </div>
            </div>
          </main>
          </div>
        </Sheet>
      </div>
    </div>
  )
}