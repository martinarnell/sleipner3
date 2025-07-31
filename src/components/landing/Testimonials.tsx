'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

import { CTAButton } from '@/components/ui/cta-button'
import { BetaAccessModal } from '@/components/BetaAccessModal'

const betaResults = [
  {
    metric: "68%",
    label: "average cost reduction",
    description: "Across 47 teams in private beta"
  },
  {
    metric: "< 1 week",
    label: "to see savings",
    description: "Most teams see results immediately"
  },
  {
    metric: "0",
    label: "quality complaints",
    description: "Our grading system maintains standards"
  }
]

const testimonials = [
  {
    quote: "We cut our OpenAI bill from $12k to $3.2k a month—and the integration took 5 minutes.",
    author: "Sara Envall",
    role: "CTO",
    company: "Sendra AI"
  },
  {
    quote: "Sleipner's routing saves us $18k a year. Wish we'd had it six months sooner.",
    author: "Marcus Enberg", 
    role: "Head of Engineering",
    company: "Gasell"
  }
]

export const Testimonials = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Proven Results from Private-Beta Teams
          </h2>
        </div>
        
        {/* Beta Results Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          {betaResults.map((result, i) => (
            <Card key={i} className="text-center bg-background/80 backdrop-blur-sm border-primary/20">
              <CardContent className="pt-8 pb-6">
                <div className="text-4xl font-bold text-primary mb-2">{result.metric}</div>
                <div className="font-semibold text-lg mb-2">{result.label}</div>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="bg-background/80 backdrop-blur-sm border-primary/20 p-4 sm:p-6">
              <CardContent className="p-0">
                <blockquote className="text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Beta Access CTA */}
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <CTAButton 
              variant="gradient" 
              size="lg" 
              aurora="intense"
              onClick={() => setIsModalOpen(true)}
              fullWidth
            >
              Join Private Beta
            </CTAButton>
            <p className="text-sm text-muted-foreground mt-4">
              <span className="text-primary font-medium">47 teams</span> already saving money • 
              <span className="text-primary font-medium"> 2-minute setup</span> • 
              <span className="text-primary font-medium"> Risk-free trial</span>
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