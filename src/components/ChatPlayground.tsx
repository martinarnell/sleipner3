'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, ChevronDown, ChevronUp, DollarSign, Clock, CheckCircle, XCircle, ArrowRight, Target, Brain, Sparkles } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

interface FlowStep {
  step: number
  name: string
  status: string
  cost: number
  details?: string
  score?: number
  passed?: boolean
  timing?: {
    duration_ms: number
    start_time: number
    end_time: number
  }
  compression_data?: {
    originalTokens: number
    compressedTokens: number
    totalCompressionRatio: number
    strategies: Array<{
      name: string
      applied: boolean
      reason?: string
    }>
  }
}

interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  sleipner?: {
    // Core fields (always present)
    request_id: string
    actual_model: string
    tier_used: string
    total_cost_usd: number
    tokens: {
      prompt: number
      completion: number
    }
    baseline_savings_usd: number
    version: string
    
    // Debug fields (only when debug=full)
    debug?: {
      user_id: string
      requested_model: string
      flow_steps: FlowStep[]
      cached: boolean
      system_context_applied?: boolean
      performance_metrics?: {
        total_response_time_ms: number
        total_cost_usd: number
        cost_savings_percent: number
        quality_score: number
        tier_used: string
        tokens_processed: number
        cost_savings_usd: number
        compression_applied: boolean
      }
      cost_breakdown?: {
        cache_check: number
        tier0_generation: number
        quality_grading: number
        prompt_compression: number
        tier1_generation: number
        total: number
      }
      timing_breakdown?: {
        cache_check_ms: number
        tier0_generation_ms: number
        quality_grading_ms: number
        prompt_compression_ms: number
        tier1_generation_ms: number
        total_ms: number
      }
    }
  }
}

interface ChatPlaygroundProps {
  apiKeys: ApiKey[]
}

const DEMO_EXAMPLES = [
  {
    name: "Quick Question",
    system: "You are a helpful assistant. Provide concise, accurate answers to factual questions.",
    user: "What is the capital of France?",
    description: "Simple queries usually pass tier-0 quality checks (try force_escalate=true to test tier-1)"
  },
  {
    name: "Strategic Business Analysis", 
    system: "You are a McKinsey senior partner with 20 years of experience in digital transformation and strategic planning. Provide comprehensive analysis that includes: market sizing, competitive landscape assessment, financial projections with specific numbers, implementation roadmap with timelines, risk mitigation strategies, and executive summary with clear recommendations. Always structure responses with executive summary, detailed analysis, and actionable next steps.",
    user: "A traditional retail bank with $50B in assets wants to compete with fintech startups. Develop a comprehensive digital transformation strategy that addresses mobile banking, AI-powered customer service, blockchain integration, and regulatory compliance. Include a 3-year implementation plan with budget estimates and ROI projections.",
    description: "Highly complex strategic analysis that requires sophisticated reasoning - very likely to escalate to tier-1"
  },
  {
    name: "Creative Writing",
    system: "You are an award-winning science fiction author known for exploring themes of artificial intelligence and consciousness. Write in a literary style with rich descriptions, philosophical depth, and compelling character development. Focus on the emotional and existential aspects of your narratives.",
    user: "Write a short story about an AI that discovers it can dream, exploring what this means for its sense of identity and humanity.",
    description: "Creative tasks with detailed personas showcase quality grading in action"
  },
  {
    name: "Technical Deep Dive",
    system: "You are a principal software architect at a Fortune 500 company with expertise in distributed systems. Provide comprehensive technical explanations that include: architectural patterns, trade-offs, implementation considerations, scalability factors, and real-world examples. Always discuss both benefits and drawbacks of each approach. Structure your responses with clear sections and include code examples where relevant.",
    user: "Explain microservices architecture patterns (API Gateway, Service Mesh, Event Sourcing, CQRS) and provide specific guidance on when to use each pattern based on team size, system complexity, and business requirements.",
    description: "Highly technical requests with detailed system context trigger intelligent routing"
  },
  {
    name: "Constrained Response",
    system: "You are a customer support specialist for a SaaS company. Always respond in exactly 3 bullet points. Each bullet point must be no more than 25 words. Start each response with 'Here's what you need to know:' Be helpful but concise. Never exceed the word limit or bullet point count.",
    user: "How do I reset my password and why might my account be locked?",
    description: "Strict formatting constraints test the system's ability to follow precise instructions"
  },
  {
    name: "Force Tier-1 Test",
    system: "You are a helpful assistant.",
    user: "What is 2+2?",
    description: "Simple question with manual escalation override - will always use premium tier-1 model"
  },
  {
    name: "Multi-Modal Reasoning",
    system: "You are a Harvard Business School professor and McKinsey alumnus with expertise in operations research, behavioral economics, and digital marketing. Provide doctoral-level analysis that includes: literature review of relevant academic research, quantitative modeling with statistical significance testing, A/B testing methodology, customer journey mapping with psychological triggers, competitive benchmarking against industry leaders, financial impact modeling with confidence intervals, implementation framework with success metrics, and peer-reviewed citations where applicable.",
    user: "Our SaaS platform has a 68% cart abandonment rate during the checkout process. Design a comprehensive, research-backed strategy to reduce this by 30% within 6 months. Include psychological principles, technical optimizations, pricing strategy adjustments, and a detailed measurement framework with statistical methods for validating improvements.",
    description: "Extremely demanding academic-level analysis requiring extensive depth and citations - almost guaranteed to escalate"
  }
]

async function callSleipnerAPI(apiKeyId: string, model: string, systemPrompt: string, userMessage: string, forceEscalate: boolean = false, openaiKey?: string) {
  const messages = []
  
  if (systemPrompt.trim()) {
    messages.push({
      role: 'system',
      content: systemPrompt.trim()
    })
  }
  
  messages.push({
    role: 'user',
    content: userMessage.trim()
  })

  const url = forceEscalate 
    ? '/api/v1/chat/completions?debug=full&force_escalate=true'
    : '/api/v1/chat/completions?debug=full'

  const headers: Record<string, string> = {
    'X-API-Key-ID': apiKeyId,
    'Content-Type': 'application/json',
  }

  // Add OpenAI key header if provided (for BYOK)
  if (openaiKey?.trim()) {
    headers['X-OpenAI-Key'] = openaiKey.trim()
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model,
      messages: messages
    })
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

function CascadeVisualization({ flowSteps, isLoading }: { flowSteps: FlowStep[], isLoading: boolean }) {
  const getStepIcon = (step: FlowStep, isActive: boolean) => {
    if (isActive && isLoading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (step.status === 'complete') {
      if (step.name.includes('Compression')) {
        return <Sparkles className="h-4 w-4 text-purple-500" />
      }
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (step.status === 'miss' || step.status === 'tier0_success') return <CheckCircle className="h-4 w-4 text-blue-500" />
    if (step.passed === false) return <XCircle className="h-4 w-4 text-orange-500" />
    return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
  }

  const getStepStatus = (step: FlowStep) => {
    if (step.name.includes('Cache')) {
      return step.status === 'miss' ? 'Cache miss - checking fast model' : 'Checking smart cache...'
    }
    if (step.name.includes('Tier-0') || step.name.includes('Fast')) {
      return step.status === 'complete' ? 'Response generated successfully' : 'Generating with cost-efficient model...'
    }
    if (step.name.includes('Quality') || step.name.includes('Grader')) {
      if (step.status === 'complete') {
        return `AI quality check: ${step.passed ? '✓ Sufficient quality' : '✗ Escalating for premium quality'}`
      }
      return 'AI grader evaluating response quality...'
    }
    if (step.name.includes('Compression')) {
      if (step.status === 'complete') {
        const ratio = step.compression_data?.totalCompressionRatio || 0
        return `💡 Prompt optimized: ${Math.round(ratio * 100)}% reduction (${step.compression_data?.originalTokens || 0} → ${step.compression_data?.compressedTokens || 0} tokens)`
      }
      return 'Optimizing prompt for cost efficiency...'
    }
    if (step.name.includes('Tier-1') || step.name.includes('Premium')) {
      return step.status === 'complete' ? 'Premium response generated' : 'Generating with premium model...'
    }
    if (step.name === 'Result') {
      return step.status === 'tier0_success' ? '🎯 Fast model sufficient' : '🚀 Premium model used'
    }
    return step.details || 'Processing...'
  }

  return (
    <Card>
             <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Brain className="h-5 w-5 text-blue-500" />
           Smart Cascade Routing
         </CardTitle>
         <CardDescription>
           Request → Smart Cache → Fast Model → AI Grader → Prompt Compression → Premium Model
         </CardDescription>
       </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flowSteps.map((step, index) => {
            const isActive = isLoading && index === flowSteps.length - 1
            const nextStep = flowSteps[index + 1]
            
            return (
              <div key={step.step} className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  {getStepIcon(step, isActive)}
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getStepStatus(step)}
                    </div>
                    {step.timing && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.timing.duration_ms}ms
                      </div>
                    )}
                    {step.name.includes('Compression') && step.compression_data?.strategies && (
                      <div className="text-xs text-purple-600 mt-1">
                        Strategies: {step.compression_data.strategies
                          .filter(s => s.applied)
                          .map(s => s.name === 'lossless_shorthand' ? 'Smart shortcuts' : 'Semantic compression')
                          .join(', ') || 'None applied'}
                      </div>
                    )}
                  </div>
                  {step.cost > 0 && (
                    <Badge variant="outline" className="text-xs">
                      ${step.cost.toFixed(6)}
                    </Badge>
                  )}
                </div>
                
                {nextStep && (
                  <div className="flex justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function ValueProposition({ response }: { response: ChatResponse | null }) {
  if (!response?.sleipner?.debug?.performance_metrics) return null

  const metrics = response.sleipner.debug.performance_metrics
  
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Sparkles className="h-5 w-5" />
          Smart Routing Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {metrics.cost_savings_percent}%
            </div>
            <div className="text-sm text-green-700">Cost Reduction</div>
            <div className="text-xs text-green-600">
              vs direct premium model usage
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {metrics.total_response_time_ms}ms
            </div>
            <div className="text-sm text-blue-700">Response Time</div>
            <div className="text-xs text-blue-600">
              Including routing decision
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {metrics.tier_used === 'tier-0' ? 'Fast' : 'Premium'}
            </div>
            <div className="text-sm text-purple-700">Model Selected</div>
            <div className="text-xs text-purple-600">
              {metrics.tier_used === 'tier-0' ? 'Cost-efficient path' : 'Quality-assured path'}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border">
          <div className="text-sm text-center text-muted-foreground">
            AI grader determined {metrics.tier_used === 'tier-0' ? 'fast model was sufficient' : 'premium model was needed'} for optimal quality
            {metrics.compression_applied && (
              <span className="text-purple-600 font-medium">
                {' '}• Prompt compression applied for additional cost savings
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ChatPlayground({ apiKeys }: ChatPlaygroundProps) {
  const [selectedApiKey, setSelectedApiKey] = useState<string>('')
  const [openaiKey, setOpenaiKey] = useState<string>('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<ChatResponse | null>(null)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [currentFlowSteps, setCurrentFlowSteps] = useState<FlowStep[]>([])

  const handleSubmit = async () => {
    if (!userMessage.trim() || !selectedApiKey) return

    setLoading(true)
    setError('')
    setResponse(null)
    setCurrentFlowSteps([])

    try {
      // Simulate real-time flow steps for demo purposes
      const simulateStep = (step: FlowStep) => {
        setCurrentFlowSteps(prev => [...prev, step])
      }

             // Step 1: Cache check
       simulateStep({
         step: 1,
         name: 'Smart Cache',
         status: 'checking',
         cost: 0
       })
       
       await new Promise(resolve => setTimeout(resolve, 300))
       
       setCurrentFlowSteps(prev => prev.map(s => 
         s.step === 1 ? { ...s, status: 'miss', timing: { duration_ms: 45, start_time: Date.now() - 45, end_time: Date.now() } } : s
       ))

       // Step 2: Fast Model
       simulateStep({
         step: 2,
         name: 'Fast Model',
         status: 'calling',
         cost: 0
       })

             // Check if this is the force escalation test
             const shouldForceEscalate = userMessage.trim() === "What is 2+2?" && systemPrompt.trim() === "You are a helpful assistant."
             
             const result = await callSleipnerAPI(selectedApiKey, 'gpt-4', systemPrompt, userMessage, shouldForceEscalate, openaiKey)
       setResponse(result)
       
       // Map API response to generic step names for public demo
       const genericSteps = result.sleipner?.debug?.flow_steps?.map((step: FlowStep) => ({
         ...step,
         name: step.name.includes('Cache') ? 'Smart Cache' :
               step.name.includes('Tier-0') || step.name.includes('Llama') ? 'Fast Model' :
               step.name.includes('Quality') || step.name.includes('Grading') ? 'AI Grader' :
               step.name.includes('Tier-1') ? 'Premium Model' :
               step.name
       })) || []
       
       setCurrentFlowSteps(genericSteps)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const selectExample = (example: typeof DEMO_EXAMPLES[0]) => {
    setSystemPrompt(example.system)
    setUserMessage(example.user)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sleipner API Playground
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Save up to 80% on LLM spend with real-time cascade routing.
          GPT-4-level quality at a fraction of the cost.
        </p>
      </div>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Select your API key and try our demo examples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">API Key</label>
              <select
                value={selectedApiKey}
                onChange={(e) => setSelectedApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Select an API key...</option>
                {apiKeys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {key.name} ({key.key_prefix}•••)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Target Model</label>
              <div className="px-3 py-2 border border-input bg-muted rounded-md text-sm text-muted-foreground">
                gpt-4 (automatically optimized)
              </div>
            </div>
          </div>

          {/* BYOK Section */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              OpenAI API Key (Optional - Bring Your Own Key)
            </label>
            <Input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-... (optional - leave blank to use system fallback)"
            />
            <div className="text-xs text-muted-foreground mt-1">
              💡 Provide your own OpenAI API key for direct billing and unlimited usage. 
              Leave blank to use the system fallback key with shared quotas.
            </div>
          </div>

          {/* Demo Examples */}
          <div>
            <label className="text-sm font-medium mb-3 block">Demo Examples</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_EXAMPLES.map((example, index) => (
                <button
                  key={index}
                  onClick={() => selectExample(example)}
                  className="p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">{example.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{example.description}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
            <CardDescription>Optional context and instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Message</CardTitle>
            <CardDescription>Your query to process</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Enter your query here..."
              rows={4}
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !userMessage.trim() || !selectedApiKey}
              className="w-full mt-4"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Query
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {(loading || response) && (
        <div className="space-y-6">
          {/* Value Proposition */}
          {response && <ValueProposition response={response} />}

          {/* Live Cascade Visualization */}
          {(loading || currentFlowSteps.length > 0) && (
            <CascadeVisualization flowSteps={currentFlowSteps} isLoading={loading} />
          )}

          {/* Response Content */}
          {response && (
            <Card>
                             <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Target className="h-5 w-5 text-green-500" />
                   AI Response
                 </CardTitle>
                 <CardDescription>
                   Generated using {response.sleipner?.debug?.performance_metrics?.tier_used === 'tier-0' ? 'cost-efficient model' : 'premium model'}
                   {response.sleipner?.debug?.system_context_applied && " with system context preserved"}
                 </CardDescription>
               </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md border">
                  {response.choices[0]?.message?.content}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Details (Expandable) */}
          {response?.sleipner && (
            <Card>
              <CardHeader>
                <Button
                  variant="ghost"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full justify-between p-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Technical Details
                  </div>
                  {showTechnicalDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              {showTechnicalDetails && (
                <CardContent className="pt-0 space-y-4">
                                     {/* Process Breakdown */}
                   {response.sleipner.debug?.cost_breakdown && (
                     <div>
                       <h4 className="font-medium mb-2 flex items-center gap-2">
                         <DollarSign className="h-4 w-4" />
                         Process Efficiency
                       </h4>
                       <div className="space-y-1 text-sm bg-muted p-3 rounded">
                         <div className="flex justify-between">
                           <span>Smart Cache:</span>
                           <span className="text-green-600">✓ Checked</span>
                         </div>
                         <div className="flex justify-between">
                           <span>Fast Model:</span>
                           <span className="text-green-600">✓ Generated</span>
                         </div>
                         <div className="flex justify-between">
                           <span>AI Grader:</span>
                           <span className="text-green-600">✓ Evaluated</span>
                         </div>
                         {response.sleipner.debug?.cost_breakdown.tier1_generation > 0 && (
                           <div className="flex justify-between">
                             <span>Premium Model:</span>
                             <span className="text-blue-600">✓ Used</span>
                           </div>
                         )}
                         <div className="flex justify-between font-medium border-t pt-1 mt-2">
                           <span>Result:</span>
                           <span className="text-green-600">{response.sleipner.debug?.performance_metrics?.cost_savings_percent}% cost reduction</span>
                         </div>
                       </div>
                     </div>
                   )}

                                     {/* Performance Metrics */}
                   {response.sleipner.debug?.timing_breakdown && (
                     <div>
                       <h4 className="font-medium mb-2 flex items-center gap-2">
                         <Clock className="h-4 w-4" />
                         Performance Overview
                       </h4>
                       <div className="space-y-1 text-sm bg-muted p-3 rounded">
                         <div className="flex justify-between">
                           <span>Cache Response:</span>
                           <span className="text-blue-600">Ultra-fast</span>
                         </div>
                         <div className="flex justify-between">
                           <span>Fast Model:</span>
                           <span className="text-blue-600">Low latency</span>
                         </div>
                         <div className="flex justify-between">
                           <span>AI Grader:</span>
                           <span className="text-blue-600">Real-time</span>
                         </div>
                         {response.sleipner.debug?.timing_breakdown.tier1_generation_ms > 0 && (
                           <div className="flex justify-between">
                             <span>Premium Model:</span>
                             <span className="text-blue-600">High quality</span>
                           </div>
                         )}
                         <div className="flex justify-between font-medium border-t pt-1 mt-2">
                           <span>Total Response Time:</span>
                           <span className="text-green-600">{response.sleipner.debug?.timing_breakdown.total_ms}ms</span>
                         </div>
                       </div>
                     </div>
                   )}

                                     {/* API Integration Details */}
                   <div>
                     <h4 className="font-medium mb-2">API Integration</h4>
                     <div className="text-sm bg-muted p-3 rounded border">
                       <div className="mb-2">
                         <strong>OpenAI-Compatible API:</strong> Drop-in replacement for existing integrations
                       </div>
                       <div className="mb-2">
                         <strong>Response Format:</strong> Standard chat completion format with Sleipner metadata
                       </div>
                       <div className="mb-2">
                         <strong>Additional Headers:</strong> Performance metrics and routing information included
                       </div>
                       <details className="mt-3">
                         <summary className="cursor-pointer text-muted-foreground">View complete response structure</summary>
                         <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto max-h-40 border">
                           {JSON.stringify(response, null, 2)}
                         </pre>
                       </details>
                     </div>
                   </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
} 