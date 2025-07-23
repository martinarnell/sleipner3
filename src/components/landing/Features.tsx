import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Zap, Code, CheckCircle } from './icons'
import { Aurora } from '@/components/Aurora'

const features = [
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: 'Zero-Risk Pricing',
    description: 'No subscription, no seat fees. 25% of the savings we unlock—nothing more.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Drastic Cost Reduction',
    description: 'Our intelligent routing sends your queries to the most cost-effective model, saving you up to 75% on LLM costs.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Uncompromised Quality',
    description: 'We use a sophisticated grading system to ensure that the model responses meet your quality standards.',
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: 'Effortless Integration',
    description: 'A simple change to your base URL is all it takes. No refactoring or complex setup required.',
  },
]

export const Features = () => {
  return (
    <section id="features" className="relative py-24 bg-gradient-to-b from-background to-background/50 overflow-hidden">
      <Aurora variant="subtle" overlay overlayOpacity={5} />
      <div className="relative container mx-auto px-6 z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Sleipner.ai?</h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Everything you need to scale your AI products, without the massive bills.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="group bg-background/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {React.cloneElement(feature.icon, { className: "h-8 w-8 text-primary mx-auto" })}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardTitle className="mb-3 text-xl">{feature.title}</CardTitle>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 