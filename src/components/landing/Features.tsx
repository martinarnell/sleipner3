import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Zap, Code, CheckCircle } from './icons'

const features = [
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: 'Drastic Cost Reduction',
    description: 'Our intelligent routing sends your queries to the most cost-effective model, saving you up to 75% on LLM costs.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Uncompromised Quality',
    description: 'We use a sophisticated grading system to ensure that the model responses meet your quality standards.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Blazing Fast',
    description: 'With prompt compression and semantic caching, we deliver responses with minimal latency.',
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: 'Effortless Integration',
    description: 'A simple change to your base URL is all it takes. No refactoring or complex setup required.',
  },
]

export const Features = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Why Sleipner.ai?</h2>
          <p className="text-muted-foreground text-lg mt-2">
            Everything you need to scale your AI products, without the massive bills.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="bg-background/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                {feature.icon}
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2">{feature.title}</CardTitle>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 