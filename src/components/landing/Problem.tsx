import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, AlertTriangle, DollarSign } from './icons'

const problems = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    stat: "400%",
    label: "Average AI cost increase in 2024",
    description: "As usage scales, costs spiral out of control"
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    stat: "$50K+",
    label: "Monthly LLM bills for mid-size teams",
    description: "Premium models driving unsustainable costs"
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    stat: "70%",
    label: "Of queries could use cheaper models",
    description: "Most requests don't need GPT-4 level performance"
  }
]

export const Problem = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            AI Costs Are <span className="text-red-500">Spiraling Out of Control</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Teams are overpaying for AI because they're locked into using expensive models for every request.
          </p>
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
            <span className="text-foreground font-semibold">The solution isn't using cheaper models everywhere</span> — 
            it's using the right model for each specific request.
          </p>
        </div>
      </div>
    </section>
  )
} 