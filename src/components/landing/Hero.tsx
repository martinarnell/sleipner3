import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent pb-4">
          Spend Less, Innovate More
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Sleipner.ai intelligently routes your LLM calls to the most cost-effective models without compromising quality. Slash your AI spend by up to 75%.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/auth/signup">Get Started for Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  )
} 