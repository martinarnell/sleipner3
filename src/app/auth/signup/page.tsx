'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Invitation Required</CardTitle>
          <CardDescription>
            Sleipner is currently invite-only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              Account registration is by invitation only. You must be invited by an administrator to access Sleipner.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Already have an invitation?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you&apos;ve received an invitation email, click the link in the email or sign in with your email address.
              </p>
              <Link href="/auth/signin">
                <Button className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="border-t pt-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">Need access?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact our team to request an invitation to Sleipner.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:martin@sleipner.ai?subject=Request Access to Sleipner">
                    Request Invitation
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Sleipner - Intelligent Model Routing API
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 