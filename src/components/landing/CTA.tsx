import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const CTA = () => {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Slash Your AI Costs?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Integrate in minutes, see the savings immediately. Get started with our free plan today.
        </p>
        <Button asChild size="lg">
          <Link href="/auth/signup">Start Your Free Trial Now</Link>
        </Button>
      </div>
    </section>
  )
} 