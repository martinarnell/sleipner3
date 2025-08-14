import { fetchWithRetry } from '../utils/fetch'
import { sanitizeErrorMessage } from '../utils/security'
import { CompressionResult } from '../utils/compression'
import { getSpecificModelPricing, calculateCost, getFallbackPricing } from '@/lib/pricing'

export interface Message {
  role: string
  content: string
}

export interface OpenAIResponse {
  content: string
  cost: number
  promptTokens: number
  completionTokens: number
  timing: {
    duration_ms: number
    api_call_ms: number
    start_time: number
    end_time: number
  }
  cost_breakdown: {
    input_tokens: number
    output_tokens: number
    input_cost_per_1m: number
    output_cost_per_1m: number
    input_cost: number
    output_cost: number
    total_cost: number
  }
  openai_model_used: string
  key_source: 'user_provided' | 'system_fallback'
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

function buildMessagesForAPI(systemPrompts: Message[], conversationMessages: Message[]) {
  return [
    ...systemPrompts,
    ...conversationMessages
  ]
}

// Model mapping function
export function mapToOpenAIModel(requestedModel: string): string {
  const modelMap: Record<string, string> = {
    'gpt-4o': 'gpt-4o',
    'gpt-4': 'gpt-4o',
    'gpt-4-turbo': 'gpt-4o',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'chatgpt-4o-latest': 'chatgpt-4o-latest'
  }
  
  return modelMap[requestedModel] || 'gpt-4o'
}

// Step 4: Tier-1 Model (GPT-4) - now takes compressed messages and optional OpenAI key
export async function callTier1(
  messages: Message[], 
  requestedModel: string, 
  compressionData?: CompressionResult, 
  openaiKey?: string
): Promise<OpenAIResponse> {
  const startTime = Date.now()
  
  // Use provided key or fall back to system key
  const apiKey = openaiKey || process.env.OPENAI_KEY
  if (!apiKey) {
    throw new Error('No OpenAI API key available - please provide your own key or contact support')
  }

  try {
    const processedMessages = processMessages(messages)
    const apiMessages = buildMessagesForAPI(
      processedMessages.systemPrompts, 
      processedMessages.conversationMessages
    )

    // Map requested model to actual OpenAI model
    const openaiModel = mapToOpenAIModel(requestedModel)

    const apiCallStart = Date.now()
    const response = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: apiMessages,
        temperature: 0.1,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`
      
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage += ` - ${errorData.error.message}`
        }
      } catch {
        // If we can't parse the error, just use the status
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const apiCallEnd = Date.now()
    const endTime = Date.now()

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI API response')
    }

    // Get actual token counts from API response
    const promptTokens = data.usage?.prompt_tokens || 0
    const completionTokens = data.usage?.completion_tokens || 0

    // Get OpenAI pricing from database
    const openaiPricing = await getSpecificModelPricing('openai', openaiModel, null) || 
                         getFallbackPricing(openaiModel)
    const cost = calculateCost(openaiPricing, promptTokens, completionTokens)

    return {
      content,
      cost,
      promptTokens,
      completionTokens,
      timing: {
        duration_ms: endTime - startTime,
        api_call_ms: apiCallEnd - apiCallStart,
        start_time: startTime,
        end_time: endTime
      },
      cost_breakdown: {
        input_tokens: promptTokens,
        output_tokens: completionTokens,
        input_cost_per_1m: openaiPricing.inputCostPerMillionTokens,
        output_cost_per_1m: openaiPricing.outputCostPerMillionTokens,
        input_cost: (promptTokens / 1_000_000) * openaiPricing.inputCostPerMillionTokens,
        output_cost: (completionTokens / 1_000_000) * openaiPricing.outputCostPerMillionTokens,
        total_cost: cost
      },
      openai_model_used: openaiModel,
      key_source: openaiKey ? 'user_provided' : 'system_fallback'
    }
  } catch (error) {
    console.error('OpenAI API call failed:', sanitizeErrorMessage(error))
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to call OpenAI API')
  }
}