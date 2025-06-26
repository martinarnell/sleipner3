import Link from 'next/link'
import { Logo } from './icons'

export const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-bold">Sleipner.ai</span>
          </div>
          <div className="flex gap-4 mb-4 md:mb-0">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sleipner.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 