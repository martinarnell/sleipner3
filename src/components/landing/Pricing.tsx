import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from './icons';
import { Aurora } from '@/components/Aurora';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started and experience the power of AI cost savings.',
    features: [
      'Up to 1,000 requests/month',
      'Basic model routing',
      'Community support',
    ],
    cta: 'Start for Free',
  },
  {
    name: 'Enterprise',
    price: '25% of savings',
    description: 'Cost: 25% of realised savings, billed monthly.',
    features: [
      'Unlimited requests',
      'Advanced routing & fine-tuning',
      'Dedicated support & SLA',
      'If savings = €0, your Sleipner fee = €0',
    ],
    cta: 'Contact Sales',
  },
];

export const Pricing = () => {
  return (
    <section className="relative py-24 bg-background/50 overflow-hidden">
      <Aurora variant="subtle" overlay overlayOpacity={3} />
      <div className="relative container mx-auto px-6 z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Pricing that scales as your AI bill shrinks.</h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Simple, transparent pricing that scales with you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`flex flex-col relative ${
                tier.name === 'Enterprise' 
                  ? 'border-primary/30 shadow-lg shadow-primary/10 scale-105' 
                  : 'border-border/50'
              }`}
            >
              {tier.name === 'Enterprise' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="text-base mt-2">{tier.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl md:text-5xl font-bold">{tier.price}</span>
                  {tier.name === 'Free' && <span className="text-muted-foreground text-lg">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow px-8">
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-8 px-8">
                <Button 
                  asChild
                  className={`w-full py-6 text-lg ${
                    tier.name === 'Enterprise' 
                      ? 'bg-primary hover:bg-primary/90' 
                      : ''
                  }`}
                  variant={tier.name === 'Enterprise' ? 'default' : 'outline'}
                >
                  <a href="https://forms.gle/2r1R3BbCbC4fNnrr9" target="_blank" rel="noopener noreferrer">
                    {tier.cta}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 