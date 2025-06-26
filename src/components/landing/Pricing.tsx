import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from './icons';

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
    price: 'Custom',
    description: 'Tailored for large-scale applications and businesses.',
    features: [
      'Unlimited requests',
      'Advanced routing & fine-tuning',
      'Dedicated support & SLA',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
  },
];

export const Pricing = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Pricing</h2>
          <p className="text-muted-foreground text-lg mt-2">
            Simple, transparent pricing that scales with you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <Card key={tier.name} className="flex flex-col">
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div>
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.name === 'Free' && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">{tier.cta}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 