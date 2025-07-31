import Image from 'next/image'

export const Footer = () => {
  return (
    <footer className="relative bg-black border-t overflow-hidden">
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image 
              src="/sleipner_sleipner_logo_symbol.svg" 
              alt="Sleipner.ai Symbol" 
              width={24} 
              height={24}
              className="h-6 w-6"
            />
            <span className="font-bold">Sleipner.ai</span>
          </div>
          
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            {/* <div className="flex gap-4">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
            </div> */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sleipner.ai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 