import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    quote: "Sleipner cut our monthly LLM bill from six figures to low five—while our users never noticed a difference in answer quality.",
    name: 'VP Engineering',
    company: 'Fortune 500 FinTech',
  },
  {
    quote: "We integrated in an afternoon. Our CFO is thrilled, and our devs didn&apos;t have to rewrite a single line of prompt code.",
    name: 'Head of AI',
    company: 'Global E-commerce Platform',
  }
]

export const Testimonials = () => {
  return (
    <section className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Loved by Leading Teams</h2>
          <p className="text-muted-foreground text-lg mt-2">
            Don&apos;t just take our word for it. Here&apos;s what our customers say.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="bg-background/50 backdrop-blur-sm border-white/10 p-6">
              <CardContent>
                <blockquote className="text-lg italic mb-4">&quot;{testimonial.quote}&quot;</blockquote>
                <cite className="font-bold not-italic">{testimonial.name}, <span className="text-muted-foreground">{testimonial.company}</span></cite>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 