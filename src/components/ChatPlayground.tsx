'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { Send, Loader2 } from 'lucide-react'

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
    // Core identification
    requestId: string
    actualModel: string
    tierUsed: string
    totalCost: number
    baselineSavings: number
    version: string
    
    // Token information
    tokens: {
      prompt: number
      completion: number
      total: number
    }
    
    // Performance timing (always present)
    performance: {
      totalResponseTime: number
      sleipnerOverhead: number
      modelApiCalls: number
      graderApiCalls: number
      graderClassification?: number
      graderEvaluation?: number
    }
    
    // Quality metrics (always present)
    quality: {
      score: number
      passed: boolean
      compressionApplied: boolean
    }
    
    // Cost comparison (when available)
    costComparison?: {
      flashModel: {
        name: string
        inputTokens: number
        outputTokens: number
        inputCost: number
        outputCost: number
        totalCost: number
      }
      openaiModel: {
        name: string
        inputTokens: number
        outputTokens: number
        inputCost: number
        outputCost: number
        totalCost: number
      }
      savings: {
        absoluteUsd: number
        percentageSaved: number
      }
    }
    
    // Debug data (only when debug=true)
    debug?: {
      userId: string
      requestedModel: string
      systemContextApplied: boolean
      cached: boolean
      
      // Detailed cost breakdown
      costBreakdown: {
        cacheCheck: number
        tier0Generation: number
        qualityGrading: number
        promptCompression: number
        tier1Generation: number
        total: number
      }
      
      // Detailed timing breakdown
      timingBreakdown: {
        cacheCheck: number
        tier0Generation: number
        qualityGrading: number
        promptCompression: number
        tier1Generation: number
        total: number
      }
      
      // Flow steps for debugging
      flowSteps: FlowStep[]
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
    name: "Force Tier-1 Test",
    system: "You are a helpful assistant.",
    user: "What is 2+2?",
    description: "Simple question with manual escalation override - will always use premium tier-1 model"
  }
]

async function callSleipnerAPI(apiKeyId: string, model: string, systemPrompt: string, userMessage: string, forceEscalate: boolean = false) {
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





export default function ChatPlayground({ apiKeys }: ChatPlaygroundProps) {
  const [selectedApiKey, setSelectedApiKey] = useState<string>('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<ChatResponse | null>(null)

  // Auto-select the first API key when component mounts or apiKeys change
  useEffect(() => {
    if (apiKeys.length > 0 && !selectedApiKey) {
      setSelectedApiKey(apiKeys[0].id)
    }
  }, [apiKeys, selectedApiKey])

  const handleSubmit = async () => {
    if (!userMessage.trim() || !selectedApiKey) return

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      // Check if this is the force escalation test
      const shouldForceEscalate = userMessage.trim() === "What is 2+2?" && systemPrompt.trim() === "You are a helpful assistant."
      
      const result = await callSleipnerAPI(selectedApiKey, 'gpt-4', systemPrompt, userMessage, shouldForceEscalate)
      setResponse(result)
      
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
          Test how smart routing works with different types of queries.
          See the API in action with real examples.
        </p>
      </div>

      {/* Main Layout: Left Controls, Right Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Configuration and Prompts */}
        <div className="space-y-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Try our demo examples or create your own prompts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Demo Examples */}
              <div>
                <label className="text-sm font-medium mb-3 block">Demo Examples</label>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_EXAMPLES.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => selectExample(example)}
                      className="p-3 text-left border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-sm">{example.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{example.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
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

          {/* User Message */}
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

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Right Column: Response */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
              <CardDescription>AI response will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Processing...</span>
                </div>
              )}

              {response && (
                <div className="space-y-4">
                  {/* Simple Stages Display */}
                  {response.sleipner?.debug && (
                    <div className="bg-background p-3 rounded border text-xs space-y-1">
                      <div className="font-medium">Routing Process:</div>
                      
                      {/* Flow Steps */}
                      {response.sleipner.debug.flowSteps?.map((step, index) => {
                        // Clean up status text
                        const cleanStatus = step.status?.replace(/\d+$/, '') || step.status;
                        
                        // Determine result text based on step type and status
                        let resultText = '';
                        const isFlashModel = step.name.includes('Tier-0') || step.name.includes('Llama') || step.name.includes('Flash');
                        const isGrader = step.name.includes('Quality') || step.name.includes('Grading');
                        const isFreeOperation = isFlashModel || isGrader || step.name.includes('Cache') || step.name.includes('Compression');
                        
                        if (step.name.includes('Cache')) {
                          resultText = cleanStatus === 'miss' ? 'Miss' : 'Hit';
                        } else if (isGrader) {
                          if (step.score) {
                            resultText = `Score: ${step.score}`;
                            if (step.passed !== undefined) {
                              resultText += ` (${step.passed ? 'Quality OK' : 'Needs better model'})`;
                            }
                          }
                        } else if (cleanStatus === 'complete') {
                          resultText = 'Done';
                        } else {
                          resultText = cleanStatus;
                        }
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div>
                              {step.name}: {resultText}
                              {step.timing && ` - ${step.timing.duration_ms}ms`}
                              {!isFreeOperation && step.cost > 0 && ` - $${step.cost.toFixed(6)}`}
                              {isFreeOperation && ' - free'}
                            </div>
                            
                            {/* Detailed Grading Information */}
                            {(step.name.includes('Quality') || step.name.includes('Grading')) && (
                              <div className="ml-2 text-gray-600 space-y-1">
                                {/* Show details if available */}
                                {step.details && (
                                  <div>Details: {step.details}</div>
                                )}
                                
                                {/* Check for category scores in step data */}
                                {(() => {
                                  const stepAny = step as FlowStep & { grading_breakdown?: Record<string, unknown>, categories?: Record<string, unknown> } & Record<string, unknown>;
                                  const categories: string[] = [];
                                  
                                  // Common grading categories that might exist
                                  const possibleCategories = [
                                    'relevance', 'accuracy', 'completeness', 'clarity', 
                                    'coherence', 'factuality', 'helpfulness', 'safety',
                                    'instruction_following', 'task_completion'
                                  ];
                                  
                                  possibleCategories.forEach(cat => {
                                    if (stepAny[cat] !== undefined) {
                                      categories.push(`${cat}: ${stepAny[cat]}`);
                                    }
                                    if (stepAny[`${cat}_score`] !== undefined) {
                                      categories.push(`${cat}: ${stepAny[`${cat}_score`]}`);
                                    }
                                  });
                                  
                                  // Check for grading_breakdown or categories object
                                  if (stepAny.grading_breakdown) {
                                    Object.entries(stepAny.grading_breakdown).forEach(([key, value]) => {
                                      categories.push(`${key}: ${value}`);
                                    });
                                  }
                                  
                                  if (stepAny.categories) {
                                    Object.entries(stepAny.categories).forEach(([key, value]) => {
                                      categories.push(`${key}: ${value}`);
                                    });
                                  }
                                  
                                  return categories.length > 0 ? (
                                    <div>
                                      Categories: {categories.join(', ')}
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            )}
                            
                            {/* Compression Details */}
                            {step.compression_data && (
                              <div className="ml-2 text-gray-600">
                                Compression: {step.compression_data.originalTokens} → {step.compression_data.compressedTokens} tokens 
                                ({Math.round(step.compression_data.totalCompressionRatio * 100)}% reduction)
                                {step.compression_data.strategies?.length > 0 && (
                                  <div className="ml-2">
                                    Strategies: {step.compression_data.strategies
                                      .filter(s => s.applied)
                                      .map(s => s.name)
                                      .join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Timing Breakdown */}
                      {response.sleipner.performance && (
                        <div className="pt-1 border-t border-gray-200 space-y-1">
                          <div className="font-medium text-gray-700">Timing Breakdown:</div>
                          <div className="text-gray-600 space-y-0.5">
                            <div>Total Response: {response.sleipner.performance.totalResponseTime}ms</div>
                            <div>• Sleipner Overhead: {response.sleipner.performance.sleipnerOverhead}ms</div>
                            <div>• Model API Calls: {response.sleipner.performance.modelApiCalls}ms</div>
                            {response.sleipner.performance.graderApiCalls > 0 && (
                              <div>
                                • Grader API Calls: {response.sleipner.performance.graderApiCalls}ms
                                {(response.sleipner.performance.graderClassification || response.sleipner.performance.graderEvaluation) && (
                                  <div className="ml-4 text-sm text-gray-500">
                                    {response.sleipner.performance.graderClassification && 
                                      <div>- Question Classification: {response.sleipner.performance.graderClassification}ms</div>
                                    }
                                    {response.sleipner.performance.graderEvaluation && 
                                      <div>- Multi-Dimensional Evaluation: {response.sleipner.performance.graderEvaluation}ms</div>
                                    }
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Overhead includes: cache check, compression, flow logic, and response processing
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Final Result */}
                      <div className="font-medium pt-1">
                        Final: {response.sleipner.tierUsed} model 
                        {response.sleipner.tierUsed === 'tier-0' 
                          ? '(free operations only)'
                          : response.sleipner.totalCost > 0 
                            ? `($${response.sleipner.totalCost?.toFixed(6)} paid operations)`
                            : '(no cost - free operations only)'
                        }
                      </div>
                      
                      {/* Cost Comparison */}
                      {response.sleipner.costComparison && (
                        <div className="mt-3 p-3 border border-green-200 rounded-lg bg-green-50">
                          <div className="font-medium text-green-800 mb-2">💰 Cost Comparison vs OpenAI</div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {/* Flash Model Column */}
                            <div className="space-y-1">
                              <div className="font-medium text-gray-800">Flash Model Used</div>
                              <div className="text-xs text-gray-600">{response.sleipner.costComparison.flashModel.name}</div>
                              <div className="text-xs">
                                <div>{response.sleipner.costComparison.flashModel.inputTokens} input + {response.sleipner.costComparison.flashModel.outputTokens} output tokens</div>
                                <div className="font-medium text-green-700">
                                  ${response.sleipner.costComparison.flashModel.totalCost < 0.000001 
                                    ? '< 0.000001' 
                                    : response.sleipner.costComparison.flashModel.totalCost.toFixed(6)}
                                </div>
                              </div>
                            </div>
                            
                            {/* OpenAI Model Column */}
                            <div className="space-y-1">
                              <div className="font-medium text-gray-800">OpenAI Alternative</div>
                              <div className="text-xs text-gray-600">{response.sleipner.costComparison.openaiModel.name}</div>
                              <div className="text-xs">
                                <div>{response.sleipner.costComparison.openaiModel.inputTokens} input + {response.sleipner.costComparison.openaiModel.outputTokens} output tokens</div>
                                <div className="font-medium text-red-600">
                                  ${response.sleipner.costComparison.openaiModel.totalCost < 0.000001 
                                    ? '< 0.000001' 
                                    : response.sleipner.costComparison.openaiModel.totalCost.toFixed(6)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Savings Summary */}
                          <div className="mt-3 pt-2 border-t border-green-300">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-green-800">You saved:</span>
                              <div className="text-right">
                                <div className="font-bold text-green-700">
                                  ${response.sleipner.costComparison.savings.absoluteUsd < 0.000001 
                                    ? '< 0.000001' 
                                    : response.sleipner.costComparison.savings.absoluteUsd.toFixed(6)}
                                </div>
                                <div className="text-xs text-green-600">
                                  ({response.sleipner.costComparison.savings.percentageSaved < 0.1 
                                    ? '< 0.1%' 
                                    : response.sleipner.costComparison.savings.percentageSaved.toFixed(1) + '%'} savings)
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Response Content */}
                  <div className="bg-muted p-4 rounded border">
                    <div className="whitespace-pre-wrap text-sm">
                      {response.choices[0]?.message?.content}
                    </div>
                  </div>
                </div>
              )}

              {!loading && !response && (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Send a query to see the AI response here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 