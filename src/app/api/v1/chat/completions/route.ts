import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey, verifyApiKeyById } from '@/lib/api-keys'
import { logApiRequestAsync } from '@/lib/api-logging'
import { logLlmRequestAsync } from '@/lib/llm-logging'
import { calculateCostComparison, type CostComparison, type Message as CostComparisonMessage } from '@/lib/cost-comparison'
import { runCascadeFlow } from '@/utils/cascade'
import { countTokensWithOverhead } from '@/utils/token-counting'
import { sanitizeForLogging, sanitizeErrorMessage } from '@/utils/security'

// ========== SLEIPNER CASCADE SYSTEM ==========

// Define message interface for route handler
interface Message {
  role: string
  content: string
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now()
  const requestId = `req_${Date.now()}${Math.random().toString(36).substr(2, 6)}`
  let userId: string | undefined
  let apiKeyId: string | undefined
  let requestBody: unknown
  
  try {
    // Check for debug mode (query param or header)
    const { searchParams } = new URL(request.url)
    const debugParam = searchParams.get('debug')
    const debugHeader = request.headers.get('x-sleipner-debug')
    const forceEscalate = searchParams.get('force_escalate') === 'true'
    const debugMode = debugParam === 'full' || debugParam === 'true' || debugHeader === 'full' || debugHeader === 'flow,timing'

    // Check for API key ID header (from playground) or Authorization header (from direct API usage)
    apiKeyId = request.headers.get('x-api-key-id') || undefined
    const authHeader = request.headers.get('authorization')
    
    // Check for optional OpenAI API key header (for BYOK - Bring Your Own Key)
    const openaiKeyHeader = request.headers.get('x-openai-key')

    // If API key ID provided, verify it
    if (apiKeyId) {
      const keyData = await verifyApiKeyById(apiKeyId)
      if (!keyData.valid) {
        return NextResponse.json(
          { error: 'Invalid API key ID' },
          { status: 401 }
        )
      }
      userId = keyData.userId
    } else if (authHeader) {
      // Extract key from Bearer token
      const match = authHeader.match(/Bearer\s+(.+)/)
      if (!match || !match[1]) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }
      
      const apiKey = match[1]
      const keyData = await verifyApiKey(apiKey)
      if (!keyData.valid) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }
      userId = keyData.userId
      // For direct API key usage, we don't have the key ID readily available
      apiKeyId = undefined
    } else {
      return NextResponse.json(
        { error: 'Missing API key or authorization header' },
        { status: 401 }
      )
    }

    // Parse request body
    try {
      requestBody = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { messages, model = 'gpt-4o' } = requestBody as {
      messages: Message[]
      model?: string
    }

    // Validate request structure
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate message structure
    for (const message of messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          { error: 'Each message must have role and content' },
          { status: 400 }
        )
      }
    }

    // Run Sleipner's cascade flow
    const cascadeResult = await runCascadeFlow(messages as Message[], model, forceEscalate, openaiKeyHeader || undefined)
    
    const tokenCounts = countTokensWithOverhead(messages as Message[], cascadeResult.response || '')
    const promptTokens = tokenCounts.inputTokens
    const completionTokens = tokenCounts.outputTokens
    
    // Calculate baseline savings (what they would have paid for direct premium model)
    // Calculate direct premium cost using database pricing  
    let costComparison: CostComparison | null = null
    const baselineSavings = 0
    
    try {
      // Calculate cost comparison with the flash model they would have used
      costComparison = await calculateCostComparison(
        messages as CostComparisonMessage[],
        cascadeResult.response,
        cascadeResult.model,
        model, // requested OpenAI model
        cascadeResult.cost
      )
    } catch (error) {
      console.error('Error calculating cost comparison:', sanitizeErrorMessage(error))
      // Continue without cost comparison if it fails
    }
    
    // Build clean sleipner response object
    const sleipnerCore = {
      // Core identification
      requestId: requestId,
      actualModel: cascadeResult.model,
      tierUsed: cascadeResult.performance_metrics?.tier_used || 'unknown',
      totalCost: Number(cascadeResult.cost.toFixed(6)),
      baselineSavings: Number(baselineSavings.toFixed(6)),
      version: '2025-01-16',
      
      // Token information
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens
      },
      
      // Performance timing (always present)
      performance: {
        totalResponseTime: cascadeResult.performance_metrics?.total_response_time_ms || 0,
        sleipnerOverhead: cascadeResult.performance_metrics?.sleipner_overhead_ms || 0,
        modelApiCalls: cascadeResult.performance_metrics?.model_api_calls_ms || 0,
        graderApiCalls: cascadeResult.performance_metrics?.grader_api_calls_ms || 0,
        graderClassification: cascadeResult.performance_metrics?.grader_classification_ms || 0,
        graderEvaluation: cascadeResult.performance_metrics?.grader_evaluation_ms || 0
      },
      
      // Quality metrics (always present)
      quality: {
        score: cascadeResult.performance_metrics?.quality_score || 0,
        passed: cascadeResult.performance_metrics?.tier_used === 'tier-0',
        compressionApplied: cascadeResult.performance_metrics?.compression_applied || false
      },
      
      // Cost comparison (when available)
      costComparison: costComparison
    }
    
    // Add debug data if requested
    const sleipnerPayload = debugMode ? {
      ...sleipnerCore,
      debug: {
        userId: userId,
        requestedModel: model,
        systemContextApplied: cascadeResult.systemContextApplied || false,
        cached: cascadeResult.cached || false,
        
        // Detailed cost breakdown
        costBreakdown: {
          cacheCheck: cascadeResult.cost_breakdown?.cache_check || 0,
          tier0Generation: cascadeResult.cost_breakdown?.tier0_generation || 0,
          qualityGrading: cascadeResult.cost_breakdown?.quality_grading || 0,
          promptCompression: cascadeResult.cost_breakdown?.prompt_compression || 0,
          tier1Generation: cascadeResult.cost_breakdown?.tier1_generation || 0,
          total: cascadeResult.cost_breakdown?.total || 0
        },
        
        // Detailed timing breakdown
        timingBreakdown: {
          cacheCheck: cascadeResult.timing_breakdown?.cache_check_ms || 0,
          tier0Generation: cascadeResult.timing_breakdown?.tier0_generation_ms || 0,
          qualityGrading: cascadeResult.timing_breakdown?.quality_grading_ms || 0,
          promptCompression: cascadeResult.timing_breakdown?.prompt_compression_ms || 0,
          tier1Generation: cascadeResult.timing_breakdown?.tier1_generation_ms || 0,
          total: cascadeResult.timing_breakdown?.total_ms || 0
        },
        
        // Flow steps for debugging
        flowSteps: cascadeResult.flow || []
      }
    } : sleipnerCore
    
    const response = {
      id: `chatcmpl-${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model, // Original requested model (OpenAI compatible)
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: cascadeResult.response
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      },
      sleipner: sleipnerPayload
    }

    // Add response headers for quick metric scraping
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Sleipner-Cost': cascadeResult.cost.toFixed(6),
      'X-Sleipner-Model': cascadeResult.model,
      'X-Sleipner-Tier': cascadeResult.performance_metrics?.tier_used || 'unknown',
      'X-Sleipner-Trace': requestId,
      'X-Sleipner-Savings': baselineSavings.toFixed(6)
    })

    // Log the successful API request asynchronously (non-blocking)
    const responseTimeMs = Date.now() - requestStartTime
    logApiRequestAsync({
      requestId,
      userId,
      apiKeyId: apiKeyId || undefined,
      endpoint: '/api/v1/chat/completions',
      httpMethod: 'POST',
      requestData: sanitizeForLogging(requestBody),
      responseData: debugMode ? sanitizeForLogging(response) : { 
        // Store minimal response data for non-debug requests
        choices_count: response.choices.length,
        completion_length: response.choices[0]?.message?.content?.length || 0,
        finish_reason: response.choices[0]?.finish_reason
      },
      responseStatus: 'success',
      modelRequested: model,
      modelUsed: cascadeResult.model,
      tierUsed: cascadeResult.performance_metrics?.tier_used,
      totalCostUsd: cascadeResult.cost,
      responseTimeMs,
      sleipnerOverheadMs: cascadeResult.performance_metrics?.sleipner_overhead_ms,
      modelApiCallsMs: cascadeResult.performance_metrics?.model_api_calls_ms,
      graderApiCallsMs: cascadeResult.performance_metrics?.grader_api_calls_ms,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      qualityScore: cascadeResult.performance_metrics?.quality_score,
      qualityPassed: cascadeResult.performance_metrics?.tier_used === 'tier-0'
    })

    // Log to new structured LLM tables (non-blocking)
    // retainPrompts defaults to true (opt-in pattern), can be made configurable per user
    const retainPrompts = process.env.RETAIN_PROMPTS !== 'false' // Default to true
    logLlmRequestAsync({
      requestId,
      userId,
      apiKeyId: apiKeyId || undefined,
      traceId: requestId, // Use requestId as trace ID
      messages: messages as Message[],
      responseContent: cascadeResult.response,
      cascadeResult,
      promptTokens,
      completionTokens,
      costSavingsUsd: baselineSavings,
      retainPrompts
    })

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error in chat completions:', sanitizeErrorMessage(error))
    
    // Log the failed API request asynchronously (non-blocking)
    const responseTimeMs = Date.now() - requestStartTime
    logApiRequestAsync({
      requestId,
      userId,
      apiKeyId: apiKeyId || undefined,
      endpoint: '/api/v1/chat/completions',
      httpMethod: 'POST',
      requestData: sanitizeForLogging(requestBody || {}),
      responseStatus: 'error',
      errorMessage: sanitizeErrorMessage(error),
      responseTimeMs
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 