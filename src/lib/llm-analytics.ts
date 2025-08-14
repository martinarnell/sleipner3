import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Get comprehensive analytics for LLM requests
 */
export async function getLlmAnalyticsDashboard(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('llm_requests')
    .select('*')
    .gte('created_at', startDate.toISOString())

  if (error) {
    console.error('Error fetching LLM analytics:', error)
    throw error
  }

  const logs = data || []
  
  // Basic metrics
  const totalRequests = logs.length
  const tier0Requests = logs.filter(log => log.tier_used === 'tier-0').length
  const tier1Requests = logs.filter(log => log.tier_used === 'tier-1').length
  const cacheHits = logs.filter(log => log.cache_hit).length
  const passedRequests = logs.filter(log => log.passed).length

  // Cost metrics
  const totalCost = logs.reduce((sum, log) => sum + (log.total_cost_usd || 0), 0)
  const totalSavings = logs.reduce((sum, log) => sum + (log.cost_savings_usd || 0), 0)
  const baselineCost = totalCost + totalSavings
  const savingsPercent = baselineCost > 0 ? (totalSavings / baselineCost) * 100 : 0

  // Performance metrics
  const avgLatency = logs.length > 0 
    ? logs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / logs.length 
    : 0
  const avgModelTime = logs.length > 0
    ? logs.reduce((sum, log) => sum + (log.model_ms || 0), 0) / logs.length
    : 0
  const avgGraderTime = logs.length > 0
    ? logs.reduce((sum, log) => sum + (log.grader_ms || 0), 0) / logs.length
    : 0
  const avgOverheadTime = logs.length > 0
    ? logs.reduce((sum, log) => sum + (log.overhead_ms || 0), 0) / logs.length
    : 0

  // Quality metrics
  const avgQualityScore = logs.length > 0
    ? logs.reduce((sum, log) => sum + (log.quality_score || 0), 0) / logs.length
    : 0
  const qualityPassRate = totalRequests > 0 ? (passedRequests / totalRequests) * 100 : 0

  // Token metrics
  const totalInputTokens = logs.reduce((sum, log) => sum + (log.prompt_tokens || 0), 0)
  const totalOutputTokens = logs.reduce((sum, log) => sum + (log.completion_tokens || 0), 0)
  const totalTokens = totalInputTokens + totalOutputTokens

  // Model usage breakdown
  const modelBreakdown = logs.reduce((acc, log) => {
    const model = log.model_used || 'unknown'
    acc[model] = (acc[model] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Hourly distribution
  const hourlyDistribution = logs.reduce((acc, log) => {
    const hour = new Date(log.created_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return {
    period: {
      days,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString()
    },
    overview: {
      totalRequests,
      tier0Requests,
      tier1Requests,
      cacheHits,
      passedRequests
    },
    costs: {
      totalCost: Number(totalCost.toFixed(6)),
      totalSavings: Number(totalSavings.toFixed(6)),
      baselineCost: Number(baselineCost.toFixed(6)),
      savingsPercent: Number(savingsPercent.toFixed(2))
    },
    performance: {
      avgLatency: Math.round(avgLatency),
      avgModelTime: Math.round(avgModelTime),
      avgGraderTime: Math.round(avgGraderTime),
      avgOverheadTime: Math.round(avgOverheadTime)
    },
    quality: {
      avgQualityScore: Number(avgQualityScore.toFixed(2)),
      qualityPassRate: Number(qualityPassRate.toFixed(2))
    },
    tokens: {
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      avgTokensPerRequest: totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0
    },
    breakdowns: {
      modelBreakdown,
      hourlyDistribution
    }
  }
}

/**
 * Get detailed flow analysis for debugging
 */
export async function getFlowAnalysis(limit: number = 100) {
  const { data, error } = await supabase
    .from('llm_requests')
    .select('id, trace_id, tier_used, quality_score, passed, flow, grading')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching flow analysis:', error)
    throw error
  }

  const logs = data || []

  // Analyze common flow patterns
  const flowPatterns = logs.reduce((acc, log) => {
    if (!log.flow || !Array.isArray(log.flow)) return acc
    
    const pattern = log.flow.map(step => step.name).join(' → ')
    if (!acc[pattern]) {
      acc[pattern] = {
        count: 0,
        avgQualityScore: 0,
        passRate: 0,
        examples: []
      }
    }
    
    acc[pattern].count++
    acc[pattern].avgQualityScore += log.quality_score || 0
    acc[pattern].passRate += log.passed ? 1 : 0
    
    if (acc[pattern].examples.length < 3) {
      acc[pattern].examples.push({
        traceId: log.trace_id,
        qualityScore: log.quality_score,
        passed: log.passed
      })
    }
    
    return acc
  }, {} as Record<string, {
    count: number;
    avgQualityScore: number;
    passRate: number;
    totalCost: number;
    avgLatency: number;
    passed: number;
  }>)

  // Calculate averages
  Object.values(flowPatterns).forEach((pattern) => {
    pattern.avgQualityScore = Number((pattern.avgQualityScore / pattern.count).toFixed(2))
    pattern.passRate = Number(((pattern.passRate / pattern.count) * 100).toFixed(2))
  })

  // Sort by frequency
  const sortedPatterns = Object.entries(flowPatterns)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 10) // Top 10 patterns

  return {
    totalRequests: logs.length,
    flowPatterns: sortedPatterns.map(([pattern, stats]) => ({
      pattern,
      ...stats
    }))
  }
}

/**
 * Search requests by trace ID or other criteria
 */
export async function searchLlmRequests(criteria: {
  traceId?: string
  userId?: string
  modelUsed?: string
  tierUsed?: string
  passed?: boolean
  minQualityScore?: number
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  let query = supabase.from('llm_requests').select(`
    *,
    llm_messages (
      seq,
      role,
      content
    )
  `)

  if (criteria.traceId) {
    query = query.eq('trace_id', criteria.traceId)
  }
  if (criteria.userId) {
    query = query.eq('user_id', criteria.userId)
  }
  if (criteria.modelUsed) {
    query = query.eq('model_used', criteria.modelUsed)
  }
  if (criteria.tierUsed) {
    query = query.eq('tier_used', criteria.tierUsed)
  }
  if (criteria.passed !== undefined) {
    query = query.eq('passed', criteria.passed)
  }
  if (criteria.minQualityScore !== undefined) {
    query = query.gte('quality_score', criteria.minQualityScore)
  }
  if (criteria.startDate) {
    query = query.gte('created_at', criteria.startDate.toISOString())
  }
  if (criteria.endDate) {
    query = query.lte('created_at', criteria.endDate.toISOString())
  }

  query = query.order('created_at', { ascending: false })
  
  if (criteria.limit) {
    query = query.limit(criteria.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error searching LLM requests:', error)
    throw error
  }

  return data || []
}