import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from './icons'

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Sleipner.ai</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </header>
  )
} 