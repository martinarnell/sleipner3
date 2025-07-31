import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface ApiRequestLog {
  requestId: string
  userId?: string
  apiKeyId?: string
  endpoint: string
  httpMethod?: string
  requestData: unknown
  responseData?: unknown
  responseStatus?: 'success' | 'error' | 'timeout'
  errorMessage?: string
  modelRequested?: string
  modelUsed?: string
  tierUsed?: string
  totalCostUsd?: number
  responseTimeMs?: number
  sleipnerOverheadMs?: number
  modelApiCallsMs?: number
  graderApiCallsMs?: number
  inputTokens?: number
  outputTokens?: number
  qualityScore?: number
  qualityPassed?: boolean
}

/**
 * Log an API request to the database
 */
export async function logApiRequest(logData: ApiRequestLog): Promise<void> {
  try {
    const { error } = await supabase
      .from('api_request_logs')
      .insert({
        request_id: logData.requestId,
        user_id: logData.userId || null,
        api_key_id: logData.apiKeyId || null,
        endpoint: logData.endpoint,
        http_method: logData.httpMethod || 'POST',
        request_data: logData.requestData,
        response_data: logData.responseData || null,
        response_status: logData.responseStatus || 'success',
        error_message: logData.errorMessage || null,
        model_requested: logData.modelRequested || null,
        model_used: logData.modelUsed || null,
        tier_used: logData.tierUsed || null,
        total_cost_usd: logData.totalCostUsd || null,
        response_time_ms: logData.responseTimeMs || null,
        sleipner_overhead_ms: logData.sleipnerOverheadMs || null,
        model_api_calls_ms: logData.modelApiCallsMs || null,
        grader_api_calls_ms: logData.graderApiCallsMs || null,
        input_tokens: logData.inputTokens || null,
        output_tokens: logData.outputTokens || null,
        quality_score: logData.qualityScore || null,
        quality_passed: logData.qualityPassed || null
      })

    if (error) {
      console.error('Error logging API request:', error)
      // Don't throw error to avoid breaking the main API flow
    }
  } catch (error) {
    console.error('Failed to log API request:', error)
    // Don't throw error to avoid breaking the main API flow
  }
}

/**
 * Log an API request asynchronously without blocking the response
 */
export function logApiRequestAsync(logData: ApiRequestLog): void {
  // Use setImmediate to ensure this runs after the response is sent
  setImmediate(() => {
    logApiRequest(logData).catch(error => {
      console.error('Async API logging failed:', error)
    })
  })
}

/**
 * Get API request logs for a user (with pagination)
 */
export async function getUserApiLogs(
  userId: string, 
  options: {
    limit?: number
    offset?: number
    startDate?: Date
    endDate?: Date
  } = {}
) {
  const { limit = 50, offset = 0, startDate, endDate } = options
  
  let query = supabase
    .from('api_request_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (startDate) {
    query = query.gte('timestamp', startDate.toISOString())
  }

  if (endDate) {
    query = query.lte('timestamp', endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user API logs:', error)
    throw error
  }

  return data || []
}

/**
 * Get API usage analytics for a user
 */
export async function getUserApiAnalytics(userId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('api_request_logs')
    .select(`
      response_status,
      tier_used,
      total_cost_usd,
      response_time_ms,
      input_tokens,
      output_tokens,
      timestamp
    `)
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString())

  if (error) {
    console.error('Error fetching user API analytics:', error)
    throw error
  }

  const logs = data || []
  
  return {
    totalRequests: logs.length,
    successfulRequests: logs.filter(log => log.response_status === 'success').length,
    errorRequests: logs.filter(log => log.response_status === 'error').length,
    tier0Usage: logs.filter(log => log.tier_used === 'tier-0').length,
    tier1Usage: logs.filter(log => log.tier_used === 'tier-1').length,
    totalCost: logs.reduce((sum, log) => sum + (log.total_cost_usd || 0), 0),
    avgResponseTime: logs.length > 0 
      ? logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length 
      : 0,
    totalTokens: {
      input: logs.reduce((sum, log) => sum + (log.input_tokens || 0), 0),
      output: logs.reduce((sum, log) => sum + (log.output_tokens || 0), 0)
    }
  }
}