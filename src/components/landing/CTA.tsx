'use client'

import { CTAButton } from '@/components/ui/cta-button'
import { BetaAccessModal } from '@/components/BetaAccessModal'
import { useState } from 'react'

export const CTA = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-black overflow-hidden">
      <div className="relative container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
            Start Saving on AI Costs Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Join 47 teams already saving 68% on average. Risk-free trial with performance-based pricing.
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center mb-8">
            <CTAButton 
              size="lg" 
              aurora="intense"
              onClick={() => setIsModalOpen(true)}
              className="text-base sm:text-lg w-full sm:w-auto max-w-xs"
            >
              Request Beta Access
            </CTAButton>
          </div>
          
          <div className="text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-1">
            <span className="text-primary font-medium">2-minute setup</span>
            <span className="hidden sm:inline"> • </span>
            <span className="text-primary font-medium">Zero integration risk</span>
            <span className="hidden sm:inline"> • </span>
            <span className="text-primary font-medium">No upfront cost</span>
          </div>
        </div>
      </div>
      
      <BetaAccessModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </section>
  )
} 