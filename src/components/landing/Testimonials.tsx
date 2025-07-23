import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from './icons'

const betaHighlights = [
  {
    title: "First Access to Game-Changing Savings",
    description: "Be among the first teams to slash AI costs by up to 75%. Early adopters see results in their first week.",
    benefit: "Priority onboarding & dedicated support"
  },
  {
    title: "Shape the Future of AI Cost Management", 
    description: "Your feedback directly influences our roadmap. Help us build the features that matter most to your team.",
    benefit: "Lifetime enterprise pricing lock-in"
  }
]

export const Testimonials = () => {
  return (
    <section className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">Private Beta • Limited Spots</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Join the Elite Early Adopters
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Leading teams are already saving millions. <span className="text-primary font-semibold">This could be you.</span> Get exclusive early access to the AI cost revolution.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {betaHighlights.map((highlight, i) => (
            <Card key={i} className="bg-background/50 backdrop-blur-sm border-primary/20 p-6 hover:border-primary/40 transition-colors">
              <CardContent className="p-0">
                <div>
                  <h3 className="font-bold text-lg mb-2">{highlight.title}</h3>
                  <p className="text-muted-foreground mb-3">{highlight.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-primary font-medium">{highlight.benefit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="max-w-md mx-auto">
            <a 
              href="https://forms.gle/2r1R3BbCbC4fNnrr9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full text-lg px-8 py-6 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 rounded-md text-primary-foreground font-medium"
            >
              Request Private Beta Access
            </a>
            <p className="text-sm text-muted-foreground mt-3">
              <span className="text-primary font-medium">47 teams</span> already in beta • 
              <span className="text-primary font-medium"> Average 68% savings</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Quick 2-minute form • Instant confirmation
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 