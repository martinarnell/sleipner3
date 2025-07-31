import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Zap, Code, CheckCircle } from './icons'
import { Aurora } from '@/components/Aurora'

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Intelligent Model Routing',
    description: 'Automatically selects the most cost-effective model for each request while maintaining quality standards.',
    benefit: 'Up to 75% cost reduction'
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Quality Assurance',
    description: 'Built-in grading system ensures response quality meets your standards with automatic fallback to better models.',
    benefit: '99.9% quality retention'
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: 'Zero-Refactor Integration',
    description: 'Simple URL swap maintains full compatibility with existing OpenAI, Anthropic, and other LLM APIs.',
    benefit: '2-minute integration'
  },
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: 'Performance-Based Pricing',
    description: 'Pay only 25% of the savings we deliver. No upfront costs, no subscription fees, no risk.',
    benefit: 'Zero risk pricing'
  },
]

export const Features = () => {
  return (
    <section id="features" className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background/50 to-background overflow-hidden">
      <Aurora variant="subtle" overlay overlayOpacity={2} />
      <div className="relative container mx-auto px-6 z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Why Choose Sleipner</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Advanced AI routing technology that delivers results without the complexity.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="group bg-background/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {React.cloneElement(feature.icon, { className: "h-8 w-8 text-primary mx-auto" })}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardTitle className="mb-3 text-xl">{feature.title}</CardTitle>
                <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {feature.benefit}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 