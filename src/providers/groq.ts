import { fetchWithRetry } from '../utils/fetch'
import { sanitizeErrorMessage } from '../utils/security'
import { getSpecificModelPricing, calculateCost, getFallbackPricing } from '@/lib/pricing'

export interface Message {
  role: string
  content: string
}

export interface GroqResponse {
  content: string
  model: string
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

// Step 2: Tier-0 Model (Groq Llama-3-70B)
export async function callTier0(messages: Message[]): Promise<GroqResponse> {
  const startTime = Date.now()
  const groqApiKey = process.env.GROQ_KEY
  if (!groqApiKey) {
    throw new Error('GROQ_KEY environment variable not set')
  }

  try {
    const processedMessages = processMessages(messages)
    const apiMessages = buildMessagesForAPI(
      processedMessages.systemPrompts, 
      processedMessages.conversationMessages
    )

    const apiCallStart = Date.now()
    const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: apiMessages,
        temperature: 0.1,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const apiCallEnd = Date.now()
    const endTime = Date.now()

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('No content in Groq API response')
    }

    // Get actual token counts from API response
    const promptTokens = data.usage?.prompt_tokens || 0
    const completionTokens = data.usage?.completion_tokens || 0

    // Get Groq pricing from database
    const groqPricing = await getSpecificModelPricing('groq', 'llama3-70b-8192', null) || 
                        getFallbackPricing('llama3-70b')
    const cost = calculateCost(groqPricing, promptTokens, completionTokens)

    return {
      content,
      model: 'llama3-70b-8192',
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
        input_cost_per_1m: groqPricing.inputCostPerMillionTokens,
        output_cost_per_1m: groqPricing.outputCostPerMillionTokens,
        input_cost: (promptTokens / 1_000_000) * groqPricing.inputCostPerMillionTokens,
        output_cost: (completionTokens / 1_000_000) * groqPricing.outputCostPerMillionTokens,
        total_cost: cost
      }
    }
  } catch (error) {
    console.error('Groq API call failed:', sanitizeErrorMessage(error))
    throw new Error('Failed to call Groq API')
  }
}