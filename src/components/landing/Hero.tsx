import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Aurora } from '@/components/Aurora'

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Aurora Background */}
      <Aurora variant="default" overlay overlayOpacity={10} />
      
      <div className="relative container mx-auto px-6 text-center max-w-6xl z-10">
        <div className="mb-6">
          <a 
            href="https://forms.gle/2r1R3BbCbC4fNnrr9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:scale-105"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            Private Beta - Request Access
          </a>
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
          Swap one URL.<br />Cut your AI bill in half.
        </h1>
        
        <div className="mt-8 mb-10">
          <p className="text-xl md:text-2xl italic text-primary font-medium">
            and if we don&apos;t, you pay nothing.
          </p>
        </div>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Sleipner routes, caches, and compresses every LLM request—teams save{' '}
          <span className="text-primary font-semibold">up to 75%</span> with zero prompt rewrites.
        </p>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          You keep the bulk of the savings; we take a small share only when we succeed.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
            <a href="https://forms.gle/2r1R3BbCbC4fNnrr9" target="_blank" rel="noopener noreferrer">Start Saving — Risk-Free</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  )
} 