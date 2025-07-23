import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image 
            src="/sleipner_sleipner_logo_wordmark.svg" 
            alt="Sleipner.ai" 
            width={180} 
            height={65}
            className="h-10 w-auto"
            priority
          />
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