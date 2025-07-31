import { Button } from '@/components/ui/button'
import { Aurora } from '@/components/Aurora'

export const CTA = () => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-background overflow-hidden">
      <Aurora variant="minimal" overlay overlayOpacity={5} />
      <div className="relative container mx-auto px-6 text-center z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
            Start Saving on AI Costs Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Join 47 teams already saving 68% on average. Risk-free trial with performance-based pricing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto shadow-lg shadow-primary/20 w-full sm:w-auto max-w-xs">
              <a href="https://forms.gle/2r1R3BbCbC4fNnrr9" target="_blank" rel="noopener noreferrer">
                Request Beta Access
              </a>
            </Button>
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              <span className="text-primary font-medium">2-minute setup</span>
              <span className="hidden sm:inline"> • </span>
              <br className="sm:hidden" />
              <span className="text-primary font-medium">Zero integration risk</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              No upfront costs
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Pay only for savings
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 