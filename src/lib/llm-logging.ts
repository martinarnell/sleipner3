import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { CascadeResult } from '@/utils/cascade'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface Message {
  role: string
  content: string
}

export interface LlmRequestLog {
  requestId: string
  userId?: string
  apiKeyId?: string
  traceId?: string
  messages: Message[]
  responseContent: string
  cascadeResult: CascadeResult
  promptTokens: number
  completionTokens: number
  costSavingsUsd?: number
  retainPrompts?: boolean
}

/**
 * Generate a prompt hash for semantic cache analytics (no PII)
 */
function generatePromptHash(messages: Message[]): string {
  const fullPrompt = messages
    .map(m => `${m.role}:${m.content}`)
    .join('\n')
  return crypto.createHash('sha256')
    .update(fullPrompt)
    .digest('hex')
}

/**
 * Extract compression data from cascade result
 */
function extractCompressionData(cascadeResult: CascadeResult): object | null {
  const compressionStep = cascadeResult.flow?.find(step => 
    step.name === 'prompt_compression' && step.compression_data
  )
  
  if (!compressionStep?.compression_data) {
    return null
  }

  // Return structured compression data
  return {
    original_tokens: (compressionStep.compression_data as any).original_tokens || 0,
    compressed_tokens: (compressionStep.compression_data as any).compressed_tokens || 0,
    ratio: (compressionStep.compression_data as any).ratio || 1.0,
    strategies: (compressionStep.compression_data as any).strategies || []
  }
}

/**
 * Extract grading data from cascade result
 */
function extractGradingData(cascadeResult: CascadeResult): object | null {
  const gradingStep = cascadeResult.flow?.find(step => 
    step.name === 'quality_grading' && (step.score !== undefined || step.dimensionScores)
  )
  
  if (!gradingStep) {
    return null
  }

  return {
    question_type: gradingStep.questionType || 'UNKNOWN',
    dimensions: gradingStep.dimensionScores || [],
    confidence: gradingStep.confidence || 0,
    variance: gradingStep.variance || 0,
    threshold: gradingStep.threshold || 0,
    reasoning: gradingStep.grader_reasoning || null
  }
}

/**
 * Log an LLM request to the new structured tables
 */
export async function logLlmRequest(logData: LlmRequestLog): Promise<void> {
  try {
    const promptHash = generatePromptHash(logData.messages)
    const compressionData = extractCompressionData(logData.cascadeResult)
    const gradingData = extractGradingData(logData.cascadeResult)

    // Insert into llm_requests table
    const { error: requestError } = await supabase
      .from('llm_requests')
      .insert({
        id: logData.requestId,
        user_id: logData.userId || null,
        api_key_id: logData.apiKeyId || null,
        trace_id: logData.traceId || null,
        
        // Routing outcome
        tier_used: logData.cascadeResult.performance_metrics?.tier_used || null,
        model_used: logData.cascadeResult.model || null,
        cache_hit: logData.cascadeResult.cached || false,
        
        // Cost & tokens
        prompt_tokens: logData.promptTokens,
        completion_tokens: logData.completionTokens,
        total_cost_usd: Number(logData.cascadeResult.cost.toFixed(6)),
        cost_savings_usd: logData.costSavingsUsd ? Number(logData.costSavingsUsd.toFixed(6)) : null,
        
        // Latency
        latency_ms: logData.cascadeResult.performance_metrics?.total_response_time_ms || null,
        model_ms: logData.cascadeResult.performance_metrics?.model_api_calls_ms || null,
        grader_ms: logData.cascadeResult.performance_metrics?.grader_api_calls_ms || null,
        overhead_ms: logData.cascadeResult.performance_metrics?.sleipner_overhead_ms || null,
        
        // Quality
        quality_score: logData.cascadeResult.performance_metrics?.quality_score || null,
        passed: logData.cascadeResult.performance_metrics?.tier_used === 'tier-0',
        
        // JSON blobs
        breakdown: logData.cascadeResult.cost_breakdown || null,
        flow: logData.cascadeResult.flow || null,
        compression: compressionData,
        grading: gradingData,
        
        // Hash for analytics
        prompt_hash: promptHash
      })

    if (requestError) {
      console.error('Error logging LLM request:', requestError)
      return
    }

    // Insert messages if retention is enabled
    if (logData.retainPrompts !== false) { // Default to true unless explicitly disabled
      const messageRows = logData.messages.map((m, i) => ({
        request_id: logData.requestId,
        seq: i,
        role: m.role,
        content: m.content
      })).concat({
        request_id: logData.requestId,
        seq: logData.messages.length,
        role: 'assistant',
        content: logData.responseContent
      })

      const { error: messagesError } = await supabase
        .from('llm_messages')
        .insert(messageRows)

      if (messagesError) {
        console.error('Error logging LLM messages:', messagesError)
        // Don't fail the entire operation if message logging fails
      }
    }

  } catch (error) {
    console.error('Failed to log LLM request:', error)
    // Don't throw error to avoid breaking the main API flow
  }
}

/**
 * Log an LLM request asynchronously without blocking the response
 */
export function logLlmRequestAsync(logData: LlmRequestLog): void {
  // Use setImmediate to ensure this runs after the response is sent
  setImmediate(() => {
    logLlmRequest(logData).catch(error => {
      console.error('Async LLM logging failed:', error)
    })
  })
}

/**
 * Get LLM request logs for a user (with pagination)
 */
export async function getUserLlmLogs(
  userId: string, 
  options: {
    limit?: number
    offset?: number
    startDate?: Date
    endDate?: Date
    includeMessages?: boolean
  } = {}
) {
  const { limit = 50, offset = 0, startDate, endDate, includeMessages = false } = options
  
  let query = supabase
    .from('llm_requests')
    .select(includeMessages ? `
      *,
      llm_messages (
        seq,
        role,
        content
      )
    ` : '*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString())
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user LLM logs:', error)
    throw error
  }

  return data || []
}

/**
 * Get LLM usage analytics for a user
 */
export async function getUserLlmAnalytics(userId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('llm_requests')
    .select(`
      tier_used,
      total_cost_usd,
      cost_savings_usd,
      latency_ms,
      prompt_tokens,
      completion_tokens,
      quality_score,
      passed,
      cache_hit,
      created_at
    `)
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) {
    console.error('Error fetching user LLM analytics:', error)
    throw error
  }

  const logs = data || []
  
  const totalCost = logs.reduce((sum, log) => sum + (log.total_cost_usd || 0), 0)
  const totalSavings = logs.reduce((sum, log) => sum + (log.cost_savings_usd || 0), 0)
  
  return {
    totalRequests: logs.length,
    tier0Usage: logs.filter(log => log.tier_used === 'tier-0').length,
    tier1Usage: logs.filter(log => log.tier_used === 'tier-1').length,
    cacheHits: logs.filter(log => log.cache_hit).length,
    passedRequests: logs.filter(log => log.passed).length,
    totalCost,
    totalSavings,
    savingsPercent: totalCost > 0 ? (totalSavings / (totalCost + totalSavings)) * 100 : 0,
    avgLatency: logs.length > 0 
      ? logs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / logs.length 
      : 0,
    avgQualityScore: logs.length > 0
      ? logs.reduce((sum, log) => sum + (log.quality_score || 0), 0) / logs.length
      : 0,
    totalTokens: {
      input: logs.reduce((sum, log) => sum + (log.prompt_tokens || 0), 0),
      output: logs.reduce((sum, log) => sum + (log.completion_tokens || 0), 0)
    }
  }
}

/**
 * Get detailed request information by trace ID
 */
export async function getLlmRequestByTrace(traceId: string) {
  const { data, error } = await supabase
    .from('llm_requests')
    .select(`
      *,
      llm_messages (
        seq,
        role,
        content
      )
    `)
    .eq('trace_id', traceId)
    .single()

  if (error) {
    console.error('Error fetching LLM request by trace:', error)
    throw error
  }

  return data
}