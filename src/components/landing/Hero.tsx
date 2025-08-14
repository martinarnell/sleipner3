'use client'
import { CTAButton } from '@/components/ui/cta-button'
import { BetaAccessModal } from '@/components/BetaAccessModal'
import { useState } from 'react'

export const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="relative container mx-auto px-6 text-center max-w-6xl pt-8">
        {/* Refined badge with tag-like styling */}
        <div className="mb-12">
          <CTAButton 
            size="sm"
            aurora="badge"
            onClick={() => setIsModalOpen(true)}
            className="border border-primary/20 rounded-full text-xs font-medium transition-all duration-200 gap-2 px-4 py-2 tracking-wide"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Private Beta — Join the Waitlist
          </CTAButton>
        </div>
        
        {/* Optimized headline with improved wrap control */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight mb-6 max-w-4xl mx-auto px-2 sm:px-0">
          Cut Your AI Bill 75%—<span className="text-primary whitespace-nowrap">Automatically.</span>
        </h1>
        
        {/* Enhanced sub-headline with improved scan-ability */}
        <div className="mb-10">
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Change one URL and Sleipner<br className="sm:hidden" /> <em>routes, caches & compresses</em> every LLM request.
            <span className="block text-slate-200 font-bold mt-2">
              No quality loss. Zero engineering lift.
            </span>
          </p>
        </div>
        
        {/* CTA buttons with improved spacing and gradient hover effect */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-6 max-w-lg mx-auto mb-8 mt-10">
          <CTAButton 
            size="lg" 
            aurora="intense"
            onClick={() => setIsModalOpen(true)}
            className="hover:scale-105 hover:shadow-lg hover:shadow-primary/40 hover:bg-gradient-to-r hover:from-indigo-500 hover:via-sky-500 hover:to-emerald-500 active:scale-100 active:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-300"
          >
            Request Beta Access
          </CTAButton>
          {/* <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 bg-transparent border border-white/20 hover:bg-white/5 transition-all duration-200"
          >
            <Link href="/#how-it-works" className="flex items-center gap-2">
              → How it works
            </Link>
          </Button> */}
        </div>

        {/* Social proof text with improved hierarchy */}
        <div className="mb-8 sm:mb-12">
          <p className="text-sm text-slate-400 italic max-w-2xl mx-auto">
            Trusted by teams at scaleups, biotech labs & top Gen-AI startups.
          </p>
        </div>
        
        {/* Updated footer microcopy with dev-focused emphasis */}
        <div className="mt-12 sm:mt-8 text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-1">
          <span className="text-primary font-medium">No credit card required</span>
          <span className="hidden sm:inline"> • </span>
          <span className="text-primary font-medium">2-minute setup</span>
          <span className="hidden sm:inline"> • </span>
          <span className="text-primary font-medium">Risk-free trial</span>
          <span className="hidden sm:inline"> • </span>
          <span className="text-primary font-bold">🚀 OpenAI-compatible</span>
        </div>
      </div>
      
      <BetaAccessModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </section>
  )
} 