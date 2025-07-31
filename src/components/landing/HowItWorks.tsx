

const steps = [
  {
    step: 1,
    title: 'Smart Request Analysis',
    description: 'Real-time analysis of token count, complexity & semantic caching opportunities.',
    technical: 'Multi-dimensional scoring algorithm + prompt compression detection'
  },
  {
    step: 2,
    title: 'Cache & Compress',
    description: 'Semantic prompt caching checks for similar requests; compression reduces token count while preserving meaning.',
    technical: 'Vector similarity matching + context-aware compression algorithms'
  },
  {
    step: 3,
    title: 'Intelligent Model Routing',
    description: 'Dynamically selects from 15+ models—GPT-3.5 to GPT-4o to Claude Sonnet—choosing the cheapest that meets your requirements.',
    technical: 'Dynamic load balancing across providers with real-time performance monitoring'
  },
  {
    step: 4,
    title: 'Quality Check & Fallback',
    description: 'Independent judge models grade each answer; if it\'s < 90, Sleipner escalates automatically.',
    technical: '+ 43ms median latency'
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative pt-40 pb-24 bg-black overflow-hidden">
      <div className="relative container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How Sleipner Saves You Money</h2>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-12 sm:mb-16 lg:mb-20">
            <div className="order-2 lg:order-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">One Line Integration</h3>
              <div className="bg-gray-900 rounded-lg p-3 sm:p-4 lg:p-6 font-mono text-xs sm:text-sm text-green-400 overflow-x-auto">
                <div className="text-gray-500 mb-2"># Before</div>
                <div className="mb-4 min-w-0">
                  <span className="text-blue-400">base_url</span>=<span className="text-yellow-300">&quot;https://api.openai.com/v1&quot;</span>
                </div>
                <div className="text-gray-500 mb-2"># After</div>
                <div className="mb-2 min-w-0">
                  <span className="text-blue-400">base_url</span>=<span className="text-yellow-300">&quot;https://api.sleipner.ai/v1&quot;</span>
                </div>
                <div className="text-gray-500 mb-1 text-xs">headers = {'{'}
                </div>
                <div className="ml-2 sm:ml-4 mb-1 min-w-0 text-xs break-all sm:break-normal">
                  <span className="text-yellow-300">&quot;Authorization&quot;</span>: <span className="text-yellow-300">&quot;Bearer SLEIPNER_KEY&quot;</span>, <span className="text-gray-500 block sm:inline"># identifies your workspace</span>
                </div>
                <div className="ml-2 sm:ml-4 mb-1 min-w-0 text-xs break-all sm:break-normal">
                  <span className="text-yellow-300">&quot;X-Provider-OpenAI-Key&quot;</span>: <span className="text-yellow-300">&quot;sk-...&quot;</span>, <span className="text-gray-500 block sm:inline"># your own OpenAI / Anthropic / Gemini key</span>
                </div>
                <div className="text-gray-500 text-xs">{'}'}</div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-green-500 font-medium">✅ Integration done (23s)</span>
              </div>
              <p className="mt-3 text-sm text-slate-400 italic leading-relaxed">
                Add two headers—your Sleipner workspace key and your existing OpenAI / Anthropic / Gemini key. That&apos;s it.
              </p>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Your existing code remains unchanged. Sleipner acts as an intelligent proxy between your application and LLM providers.
              </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              {steps.map((step, i) => (
                <div key={i}>
                  <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-background/50 backdrop-blur-sm border border-primary/10 rounded-lg hover:border-primary/20 transition-colors">
                    <div className="bg-primary text-primary-foreground h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">
                      →
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm sm:text-base lg:text-lg mb-2 leading-tight">{step.title}</h4>
                      <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-3 leading-relaxed">{step.description}</p>
                      <p className="text-xs sm:text-sm text-primary font-medium leading-relaxed">{step.technical}</p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex justify-center my-3">
                      <div className="text-primary text-lg">↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center p-4 sm:p-6 lg:p-8 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-lg">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 leading-tight">Proven Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">75%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Average cost cut</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">99.9%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Quality retained</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">+43ms</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Latency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 