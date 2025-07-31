import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, AlertTriangle, DollarSign } from './icons'

const problems = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    stat: "4×",
    label: "average LLM spend in 2024",
    description: "Costs spiraling as AI usage scales across teams"
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    stat: "$50K+",
    label: "per month for mid-size teams",
    description: "Premium models driving unsustainable costs"
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    stat: "70%",
    label: "of prompts don't need GPT-4-level muscle",
    description: "Most requests overpay for unnecessary capability"
  }
]

export const Problem = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            AI Model Costs Are <span className="text-red-500">Exploding</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {problems.map((problem, i) => (
            <Card key={i} className="text-center bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto mb-4 p-3 rounded-full bg-red-500/10 w-fit">
                  {React.cloneElement(problem.icon, { className: "h-6 w-6 text-red-500 mx-auto" })}
                </div>
                <div className="text-3xl font-bold text-red-500 mb-2">{problem.stat}</div>
                <div className="font-semibold mb-2">{problem.label}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
            The answer isn&apos;t &quot;use cheap models everywhere&quot;—it&apos;s <span className="text-foreground font-bold">use the right model for each request</span>. Sleipner does that for you.
          </p>
        </div>
      </div>
    </section>
  )
} 