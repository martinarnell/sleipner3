import { Aurora } from '@/components/Aurora';

const steps = [
  {
    step: 1,
    title: 'Smart Request Analysis',
    description: 'Our system analyzes each LLM request in real-time, evaluating complexity, context length, and quality requirements to determine the optimal model tier.',
    technical: 'Multi-dimensional scoring algorithm considers token count, semantic complexity, and task type'
  },
  {
    step: 2,
    title: 'Intelligent Model Routing',
    description: 'Requests are automatically routed to the most cost-effective model capable of delivering the required quality, from GPT-3.5 to GPT-4o to Claude Sonnet.',
    technical: 'Dynamic load balancing across 15+ models with real-time performance monitoring'
  },
  {
    step: 3,
    title: 'Quality Assurance & Fallback',
    description: 'Every response is quality-checked by our grading system. If quality falls below your threshold, we automatically retry with a more capable model.',
    technical: 'Independent judge models score responses for accuracy, relevance, and coherence'
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-background to-background/50 overflow-hidden">
      <Aurora variant="minimal" overlay overlayOpacity={3} />
      <div className="relative container mx-auto px-6 z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How Sleipner Works</h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Advanced routing intelligence ensures you get the best quality-to-cost ratio for every request.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-12 sm:mb-16 lg:mb-20">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">One Line Integration</h3>
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6 font-mono text-xs sm:text-sm text-green-400 overflow-x-auto">
                <div className="text-gray-500 mb-2"># Before</div>
                <div className="mb-4 whitespace-nowrap">
                  <span className="text-blue-400">base_url</span>=<span className="text-yellow-300">"https://api.openai.com/v1"</span>
                </div>
                <div className="text-gray-500 mb-2"># After</div>
                <div className="whitespace-nowrap">
                  <span className="text-blue-400">base_url</span>=<span className="text-yellow-300">"https://api.sleipner.ai/v1"</span>
                </div>
              </div>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground">
                Your existing code remains unchanged. Sleipner acts as an intelligent proxy between your application and LLM providers.
              </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-background/50 backdrop-blur-sm border border-primary/10 rounded-lg hover:border-primary/20 transition-colors"
                >
                  <div className="bg-primary text-primary-foreground h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-2">{step.title}</h4>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">{step.description}</p>
                    <p className="text-xs sm:text-sm text-primary font-medium">{step.technical}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
                    <div className="text-center p-6 sm:p-8 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold mb-6">Result: Dramatic Cost Reduction Without Quality Loss</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">75%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Average cost reduction</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Quality retention rate</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">&lt; 50ms</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Additional latency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 