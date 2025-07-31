import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Aurora } from '@/components/Aurora'

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Aurora Background */}
      <Aurora variant="minimal" overlay overlayOpacity={5} />
      
      <div className="relative container mx-auto px-6 text-center max-w-6xl z-10">
        <div className="mb-8">
          <a 
            href="https://forms.gle/2r1R3BbCbC4fNnrr9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-full px-5 py-2.5 text-sm font-medium text-primary transition-all duration-200"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            Join Private Beta • Limited Access
          </a>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight mb-6 sm:mb-8">
          Intelligent AI Gateway<br />
          <span className="text-primary">75% Cost Reduction</span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6 px-4 sm:px-0">
          Sleipner automatically routes your LLM requests to the most cost-effective models while maintaining quality. 
          <span className="text-foreground font-medium"> One URL change, instant savings.</span>
        </p>
        
        <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-lg max-w-2xl mx-auto">
          <p className="text-base sm:text-lg text-primary font-semibold mb-2">Performance Guarantee</p>
          <p className="text-sm sm:text-base text-muted-foreground">
            Pay only 25% of the savings we deliver. If we don't reduce your costs, you pay nothing.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto shadow-lg">
            <a href="https://forms.gle/2r1R3BbCbC4fNnrr9" target="_blank" rel="noopener noreferrer">
              Request Beta Access
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
            <Link href="#how-it-works">Learn How It Works</Link>
          </Button>
        </div>
        
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-1">
          <span className="text-primary font-medium">No credit card required</span>
          <span className="hidden sm:inline"> • </span>
          <span className="text-primary font-medium">2-minute setup</span>
          <span className="hidden sm:inline"> • </span>
          <span className="text-primary font-medium">Risk-free trial</span>
        </div>
      </div>
    </section>
  )
} 