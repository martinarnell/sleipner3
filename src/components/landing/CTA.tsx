import { Button } from '@/components/ui/button'
import { Aurora } from '@/components/Aurora'

export const CTA = () => {
  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <Aurora variant="default" overlay overlayOpacity={8} />
      <div className="relative container mx-auto px-6 text-center z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Ready to Slash Your AI Costs?
          </h2>
          <p className="text-muted-foreground text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Integrate in minutes, see the savings immediately. Get started with our free plan today.
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto shadow-lg shadow-primary/20">
              <a href="https://forms.gle/2r1R3BbCbC4fNnrr9" target="_blank" rel="noopener noreferrer">Start Saving — Risk-Free</a>
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              No credit card required
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 