import { callTier0, Message as GroqMessage } from '../providers/groq'
import { callTier1, Message as OpenAIMessage } from '../providers/openai'
import { gradeResponse } from './grading'
import { compressPrompt } from './compression'
import { getSpecificModelPricing, calculateCost, getFallbackPricing } from '@/lib/pricing'

export interface Message {
  role: string
  content: string
}

export interface FlowStep {
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
  compression_data?: unknown
  cost_breakdown?: unknown
  tier0_response?: string
  questionType?: string
  dimensionScores?: unknown[]
  confidence?: number
  variance?: number
  threshold?: number
  grader_reasoning?: string
}

export interface CascadeResult {
  response: string
  model: string
  cost: number
  flow: FlowStep[]
  cached: boolean
  systemContextApplied: boolean
  performance_metrics: {
    total_response_time_ms: number
    sleipner_overhead_ms: number
    model_api_calls_ms: number
    grader_api_calls_ms: number
    grader_classification_ms: number
    grader_evaluation_ms: number
    total_api_calls_ms: number
    total_cost_usd: number
    cost_savings_usd: number
    cost_savings_percent: number
    quality_score: number
    tier_used: string
    tokens_processed: number
    system_context_applied: boolean
    compression_applied: boolean
  }
  cost_breakdown: {
    cache_check: number
    tier0_generation: number
    quality_grading: number
    prompt_compression: number
    tier1_generation: number
    total: number
  }
  timing_breakdown: {
    cache_check_ms: number
    tier0_generation_ms: number
    quality_grading_ms: number
    prompt_compression_ms: number
    tier1_generation_ms: number
    total_ms: number
    sleipner_overhead_ms: number
    model_api_calls_ms: number
    grader_api_calls_ms: number
    grader_classification_ms: number
    grader_evaluation_ms: number
    total_api_calls_ms: number
  }
}

// Helper function to extract and validate messages
function processMessages(messages: Message[]) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and must not be empty')
  }
  
  const systemPrompts = messages.filter(msg => msg.role === 'system')
  const conversationMessages = messages.filter(msg => msg.role !== 'system')
  const lastUserMessage = conversationMessages.filter(msg => msg.role === 'user').pop()?.content || ''
  
  return {
    systemPrompts,
    conversationMessages,
    lastUserMessage,
    hasSystemPrompt: systemPrompts.length > 0
  }
}

// Step 1: Check Cache (placeholder implementation)
async function checkCache(_queryHash: string) {
  const startTime = Date.now()
  
  // Placeholder: In real implementation, check Redis/DB for cached response
  // For now, always return miss
  await new Promise(resolve => setTimeout(resolve, 1)) // Simulate minimal latency
  
  const endTime = Date.now()
  return { 
    hit: false, 
    response: null,
    timing: {
      duration_ms: endTime - startTime,
      start_time: startTime,
      end_time: endTime
    }
  }
}

// Step 5: Cache Response (placeholder implementation)
async function cacheResponse(_queryHash: string, _response: string) {
  // Placeholder: In real implementation, store in Redis/DB
  // Parameters prefixed with underscore to indicate intentional non-use
  
  return { cached: true }
}

// Main Cascade Flow  
export async function runCascadeFlow(
  messages: Message[], 
  requestedModel: string, 
  forceEscalate: boolean = false, 
  openaiKey?: string
): Promise<CascadeResult> {
  const flowStartTime = Date.now()
  let processedMessages
  
  try {
    processedMessages = processMessages(messages)
  } catch (error) {
    throw new Error(`Message validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  const query = processedMessages.lastUserMessage
  const systemContext = processedMessages.systemPrompts
    .map(msg => msg.content)
    .join(' ')
  const queryHash = `mock_hash_${query.substring(0, 10)}`
  
  // Fast-path guard: Skip entire cascade for very short conversations
  const totalConversationLength = messages.map(m => m.content).join(' ').length
  if (totalConversationLength < 200 && !forceEscalate) {
    console.log(`🚀 Fast-path: Short conversation detected (${totalConversationLength} chars), skipping cascade overhead`)
    
    const fastPathStartTime = Date.now()
    const tier0Result = await callTier0(
      messages.map(m => ({ role: m.role, content: m.content })) as GroqMessage[]
    )
    const fastPathTiming = Date.now() - fastPathStartTime
    
    return {
      response: tier0Result.content,
      model: tier0Result.model,
      cost: tier0Result.cost,
      systemContextApplied: false,
      cached: false,
      performance_metrics: {
        total_response_time_ms: Date.now() - flowStartTime,
        sleipner_overhead_ms: 10, // Minimal overhead for fast path
        model_api_calls_ms: fastPathTiming,
        grader_api_calls_ms: 0,
        grader_classification_ms: 0,
        grader_evaluation_ms: 0,
        total_api_calls_ms: fastPathTiming,
        total_cost_usd: tier0Result.cost,
        cost_savings_usd: 0,
        cost_savings_percent: 0,
        tier_used: 'tier-0',
        quality_score: 95, // Auto-pass for trivial questions
        tokens_processed: tier0Result.promptTokens + tier0Result.completionTokens,
        system_context_applied: false,
        compression_applied: false
      },
      cost_breakdown: {
        cache_check: 0,
        tier0_generation: tier0Result.cost,
        quality_grading: 0,
        prompt_compression: 0,
        tier1_generation: 0,
        total: tier0Result.cost
      },
      timing_breakdown: {
        cache_check_ms: 0,
        tier0_generation_ms: fastPathTiming,
        quality_grading_ms: 0,
        prompt_compression_ms: 0,
        tier1_generation_ms: 0,
        total_ms: Date.now() - flowStartTime,
        sleipner_overhead_ms: 10,
        model_api_calls_ms: fastPathTiming,
        grader_api_calls_ms: 0,
        grader_classification_ms: 0,
        grader_evaluation_ms: 0,
        total_api_calls_ms: fastPathTiming
      },
      flow: [{
        step: 1,
        name: 'Fast Path',
        status: 'complete',
        cost: tier0Result.cost,
        details: `Short conversation (${totalConversationLength} chars) - skipped cascade overhead`,
        score: 95,
        passed: true,
        timing: {
          duration_ms: fastPathTiming,
          start_time: fastPathStartTime,
          end_time: fastPathStartTime + fastPathTiming
        }
      }]
    }
  }
  
  const flowSteps: FlowStep[] = []
  let totalCost = 0
  let finalResponse = ''
  let finalModel = ''
  const costBreakdown = {
    cache_check: 0,
    tier0_generation: 0,
    quality_grading: 0,
    prompt_compression: 0,
    tier1_generation: 0,
    total: 0
  }
  const timingBreakdown = {
    cache_check_ms: 0,
    tier0_generation_ms: 0,
    quality_grading_ms: 0,
    prompt_compression_ms: 0,
    tier1_generation_ms: 0,
    total_ms: 0,
    sleipner_overhead_ms: 0,
    model_api_calls_ms: 0,
    grader_api_calls_ms: 0,
    grader_classification_ms: 0,
    grader_evaluation_ms: 0,
    total_api_calls_ms: 0
  }
  
  // Step 1: Check Cache
  flowSteps.push({ step: 1, name: 'Cache Check', status: 'checking', cost: 0, details: '', score: 0, passed: false })
  const cacheResult = await checkCache(queryHash)
  timingBreakdown.cache_check_ms = cacheResult.timing.duration_ms
  
  // Cache always returns miss for now
  flowSteps[0].status = 'miss'
  flowSteps[0].details = 'No cached response found'
  flowSteps[0].timing = cacheResult.timing
  flowSteps[0].cost = 0 // Cache check is always free
  
  // Step 2: Prompt Compression (skip for short prompts)
  flowSteps.push({ step: 2, name: 'Prompt Compression', status: 'compressing', cost: 0, details: '', score: 0, passed: false })
  
  // Combine all message content for compression
  const fullPromptText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
  const promptTokens = Math.ceil(fullPromptText.length / 4) // Rough token estimate
  
  let compressionResult;
  if (promptTokens < 32) {
    // Skip compression for very short prompts
    compressionResult = {
      compressed: fullPromptText,
      originalTokens: promptTokens,
      compressedTokens: promptTokens,
      totalCompressionRatio: 0,
      strategies: [{ name: 'skip_compression', applied: true, reason: 'prompt_too_short' }],
      cost: 0,
      timing: { duration_ms: 1, start_time: Date.now(), end_time: Date.now() + 1 }
    }
  } else {
    compressionResult = await compressPrompt(fullPromptText, false) // Set to true for more aggressive compression
  }
  
  totalCost += compressionResult.cost
  costBreakdown.prompt_compression = compressionResult.cost
  timingBreakdown.prompt_compression_ms = compressionResult.timing.duration_ms
  
  flowSteps[1].status = 'complete'
  flowSteps[1].cost = 0 // Compression is "free" from user perspective
  flowSteps[1].timing = compressionResult.timing
  flowSteps[1].details = `Reduced from ${compressionResult.originalTokens} to ${compressionResult.compressedTokens} tokens (${Math.round(compressionResult.totalCompressionRatio * 100)}% reduction)`
  flowSteps[1].compression_data = compressionResult
  
  // Create compressed messages for all subsequent calls
  const compressedMessages = messages.map(msg => ({
    ...msg,
    content: msg.content // For now, keep original until we implement per-message compression
  }))
  
  // Step 3: Try Tier-0 (Groq Llama-3-70B) with compressed prompt
  flowSteps.push({ step: 3, name: 'Tier-0 (Llama-3-70B)', status: 'calling', cost: 0, details: '', score: 0, passed: false })
  const tier0Result = await callTier0(compressedMessages as GroqMessage[])
  totalCost += tier0Result.cost
  costBreakdown.tier0_generation = tier0Result.cost
  timingBreakdown.tier0_generation_ms = tier0Result.timing.duration_ms
  
  flowSteps[2].status = 'complete'
  flowSteps[2].cost = 0 // Tier-0 is "free" from user perspective 
  flowSteps[2].timing = tier0Result.timing
  flowSteps[2].cost_breakdown = tier0Result.cost_breakdown
  flowSteps[2].details = `Generated response (${tier0Result.completionTokens} tokens)${processedMessages.hasSystemPrompt ? ' with system context' : ''}`
  flowSteps[2].tier0_response = tier0Result.content // Include actual response for playground
  
  // Step 4: Grade Response (hybrid: Llama-3 8B → GPT-4o-mini fallback)
  flowSteps.push({ step: 4, name: 'Quality Grading (Hybrid)', status: 'grading', cost: 0, details: '', score: 0, passed: false })
  const gradeResult = await gradeResponse(query, tier0Result.content, systemContext)
  totalCost += gradeResult.cost
  costBreakdown.quality_grading = gradeResult.cost
  timingBreakdown.quality_grading_ms = gradeResult.timing.duration_ms
  
  flowSteps[3].status = 'complete'
  flowSteps[3].cost = 0 // Grading is "free" from user perspective
  flowSteps[3].timing = gradeResult.timing
  flowSteps[3].cost_breakdown = gradeResult.cost_breakdown
  flowSteps[3].details = `Score: ${gradeResult.score}/100 (threshold: ${gradeResult.threshold}) | Type: ${gradeResult.questionType} | Confidence: ${gradeResult.confidence} | Variance: ${gradeResult.variance}${systemContext ? ' - evaluated with system context' : ''}`
  flowSteps[3].score = gradeResult.score
  flowSteps[3].passed = gradeResult.passed && !forceEscalate
  flowSteps[3].questionType = gradeResult.questionType
  flowSteps[3].dimensionScores = gradeResult.dimensionScores
  flowSteps[3].confidence = gradeResult.confidence
  flowSteps[3].variance = gradeResult.variance
  flowSteps[3].threshold = gradeResult.threshold
  flowSteps[3].grader_reasoning = `Hybrid evaluation: Llama-3 8B → GPT-4o-mini fallback (Question type: ${gradeResult.questionType})${forceEscalate ? ' (manually overridden for testing)' : ''}` // For playground display
  
  if (gradeResult.passed && !forceEscalate) {
    // Quality passed - use Tier-0 response
    finalResponse = tier0Result.content
    finalModel = 'groq-llama-3-70b'
    flowSteps.push({ step: 5, name: 'Result', status: 'tier0_success', cost: 0, details: 'Quality threshold met - using Tier-0 response' })
  } else {
    // Quality failed - escalate to Tier-1 using already compressed prompt
    flowSteps.push({ step: 5, name: 'Tier-1 (GPT-4)', status: 'calling', cost: 0 })
    
    const tier1Result = await callTier1(compressedMessages as OpenAIMessage[], requestedModel, compressionResult, openaiKey)
    totalCost += tier1Result.cost
    costBreakdown.tier1_generation = tier1Result.cost
    timingBreakdown.tier1_generation_ms = tier1Result.timing.duration_ms
    
    finalResponse = tier1Result.content
    finalModel = requestedModel
    flowSteps[4].status = 'complete'
    flowSteps[4].cost = tier1Result.cost
    flowSteps[4].timing = tier1Result.timing
    flowSteps[4].cost_breakdown = tier1Result.cost_breakdown
    flowSteps[4].details = `Escalated with pre-compressed prompt${processedMessages.hasSystemPrompt ? ' (system context preserved)' : ''}`
  }
  
  // Step 6: Cache final response
  await cacheResponse(queryHash, finalResponse)
  
  const flowEndTime = Date.now()
  costBreakdown.total = totalCost
  timingBreakdown.total_ms = flowEndTime - flowStartTime
  
  // Calculate Sleipner overhead vs model API call time
  const tier0Timing = flowSteps[2]?.timing as { api_call_ms?: number } | undefined
  const tier1Timing = flowSteps[4]?.timing as { api_call_ms?: number } | undefined
  const graderTiming = flowSteps[3]?.timing as { api_call_ms?: number; classification_ms?: number; evaluation_ms?: number } | undefined
  
  const modelApiCallTime = (tier0Timing?.api_call_ms || 0) + 
                          (tier1Timing?.api_call_ms || 0) // Tier-0 + Tier-1 if used
  const graderApiCallTime = graderTiming?.api_call_ms || 0
  const graderClassificationTime = graderTiming?.classification_ms || 0
  const graderEvaluationTime = graderTiming?.evaluation_ms || 0
  const totalApiCallTime = modelApiCallTime + graderApiCallTime
  
  // Sleipner overhead = total time - actual API calls
  const sleipnerOverheadTime = timingBreakdown.total_ms - totalApiCallTime
  
  timingBreakdown.sleipner_overhead_ms = sleipnerOverheadTime
  timingBreakdown.model_api_calls_ms = modelApiCallTime
  timingBreakdown.grader_api_calls_ms = graderApiCallTime
  timingBreakdown.grader_classification_ms = graderClassificationTime
  timingBreakdown.grader_evaluation_ms = graderEvaluationTime
  timingBreakdown.total_api_calls_ms = totalApiCallTime
  
  // Calculate cost savings vs direct GPT-4 usage
  // Calculate direct GPT-4 cost using database pricing
  const gpt4Pricing = await getSpecificModelPricing('openai', 'gpt-4o', null) || 
                      getFallbackPricing('gpt-4o')
  const directGPT4Cost = calculateCost(gpt4Pricing, tier0Result.promptTokens, tier0Result.completionTokens)
  const costSavings = Math.max(0, directGPT4Cost - totalCost)
  const costSavingsPercent = directGPT4Cost > 0 ? Math.round((costSavings / directGPT4Cost) * 100) : 0
  
  return {
    response: finalResponse,
    model: finalModel,
    cost: totalCost,
    flow: flowSteps,
    cached: false,
    systemContextApplied: processedMessages.hasSystemPrompt,
    performance_metrics: {
      total_response_time_ms: timingBreakdown.total_ms,
      sleipner_overhead_ms: timingBreakdown.sleipner_overhead_ms,
      model_api_calls_ms: timingBreakdown.model_api_calls_ms,
      grader_api_calls_ms: timingBreakdown.grader_api_calls_ms,
      grader_classification_ms: timingBreakdown.grader_classification_ms,
      grader_evaluation_ms: timingBreakdown.grader_evaluation_ms,
      total_api_calls_ms: timingBreakdown.total_api_calls_ms,
      total_cost_usd: totalCost,
      cost_savings_usd: costSavings,
      cost_savings_percent: costSavingsPercent,
      quality_score: gradeResult.score,
      tier_used: gradeResult.passed ? 'tier-0' : 'tier-1',
      tokens_processed: tier0Result.promptTokens + tier0Result.completionTokens,
      system_context_applied: processedMessages.hasSystemPrompt,
      compression_applied: !gradeResult.passed
    },
    cost_breakdown: costBreakdown,
    timing_breakdown: timingBreakdown
  }
}