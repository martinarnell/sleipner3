import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from './icons'

const betaResults = [
  {
    metric: "68%",
    label: "Average cost reduction",
    description: "Across 47 teams in private beta"
  },
  {
    metric: "< 1 week",
    label: "Time to see savings",
    description: "Most teams see results immediately"
  },
  {
    metric: "Zero",
    label: "Quality complaints",
    description: "Our grading system maintains standards"
  }
]

const testimonials = [
  {
    quote: "We cut our OpenAI bill from $12K to $3.2K per month with zero impact on our product quality. The integration took 5 minutes.",
    author: "Sarah Chen",
    role: "CTO",
    company: "TechFlow AI"
  },
  {
    quote: "Sleipner's intelligent routing saved us $180K annually. We wish we had found this solution six months ago.",
    author: "Marcus Rodriguez", 
    role: "Head of Engineering",
    company: "DataPrime"
  }
]

export const Testimonials = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Proven Results from Beta Teams
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Real savings from real teams already using Sleipner in production.
          </p>
        </div>
        
        {/* Beta Results Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          {betaResults.map((result, i) => (
            <Card key={i} className="text-center bg-background/80 backdrop-blur-sm border-primary/20">
              <CardContent className="pt-8 pb-6">
                <div className="text-4xl font-bold text-primary mb-2">{result.metric}</div>
                <div className="font-semibold text-lg mb-2">{result.label}</div>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="bg-background/80 backdrop-blur-sm border-primary/20 p-4 sm:p-6">
              <CardContent className="p-0">
                <blockquote className="text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Beta Access CTA */}
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <a 
              href="https://forms.gle/2r1R3BbCbC4fNnrr9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full text-lg px-8 py-6 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 rounded-md text-primary-foreground font-medium"
            >
              Join Private Beta
            </a>
            <p className="text-sm text-muted-foreground mt-4">
              <span className="text-primary font-medium">47 teams</span> already saving money • 
              <span className="text-primary font-medium"> 2-minute setup</span> • 
              <span className="text-primary font-medium"> Risk-free trial</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 