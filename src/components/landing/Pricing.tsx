'use client'

import { useState } from 'react'
import { CTAButton } from '@/components/ui/cta-button'
import { BetaAccessModal } from '@/components/BetaAccessModal'

export const Pricing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <section id="pricing" className="relative py-24 bg-black overflow-hidden">
      <div className="relative container mx-auto px-6 text-center">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pricing that scales <span className="whitespace-nowrap">with your savings.</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            One simple plan while we&apos;re in private beta.
          </p>
        </div>

        {/* Single Enterprise Plan Card */}
        <div className="mx-auto max-w-xl">
          <div className="relative rounded-2xl bg-slate-900/60 ring-1 ring-slate-700/50 p-10 backdrop-blur-sm">
            {/* Private Beta Badge */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-800 px-4 py-1 text-xs tracking-wide text-slate-300 uppercase font-medium">
              Private Beta
            </span>

            {/* Plan Title */}
            <h3 className="text-lg font-semibold text-slate-200 mb-6">
              Enterprise — Performance-Based
            </h3>

            {/* Pricing Hero */}
            <div className="mb-8">
              <p className="text-5xl md:text-6xl font-extrabold mb-2 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                25<span className="text-3xl md:text-4xl align-top">%</span>
              </p>
              <p className="text-slate-400 text-lg">of realised savings, billed monthly</p>
            </div>

            {/* Features List */}
            <ul className="space-y-3 text-left text-base mb-10 max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span className="text-slate-300">Unlimited requests</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span className="text-slate-300">Advanced routing, cache & compression</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span className="text-slate-300">Dedicated success engineer & SLA</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span className="text-slate-300">€0 fee if savings = €0</span>
              </li>
            </ul>

            {/* CTA Button */}
            <CTAButton 
              size="lg"
              aurora="intense"
              onClick={() => setIsModalOpen(true)}
              fullWidth
              className="mb-4"
            >
              Request Beta Access
            </CTAButton>

            {/* Risk-free messaging */}
            <p className="text-xs text-slate-500">
              14-day proof-of-value · No credit card · Cancel anytime
            </p>
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