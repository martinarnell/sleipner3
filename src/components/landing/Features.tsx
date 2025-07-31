import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Zap, Code, CheckCircle, Shield } from './icons'

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: '🧭 Intelligent Routing',
    description: 'Up to 75% savings by matching each query to the cheapest capable model.',
    benefit: '75% savings'
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: '✅ Automatic Quality Guardrails',
    description: '99.9% quality retention—every response scored on accuracy, relevance & coherence.',
    benefit: '99.9% quality retention'
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: '⚡ 2-Minute Integration',
    description: 'Just swap your base URL; keep your existing prompts & SDKs.',
    benefit: '2-minute setup'
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: '🔐 Bring-Your-Own-Provider-Key',
    description: 'Keep your existing OpenAI / Anthropic account and quotas. Keys forwarded securely, never stored.',
    benefit: 'Full security control'
  },
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: '💸 Performance-Based Pricing',
    description: 'Pay 25% of the savings we deliver—if we save zero, you pay zero.',
    benefit: 'Zero risk'
  },
]

export const Features = () => {
  return (
    <section id="features" className="relative py-16 sm:py-20 lg:py-24 bg-black overflow-hidden">
      <div className="relative container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Why Choose Sleipner</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Advanced AI routing technology that delivers results without the complexity.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
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