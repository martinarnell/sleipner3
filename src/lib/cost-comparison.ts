import { encoding_for_model } from 'tiktoken'
import { getSpecificModelPricing, getFallbackPricing, type ModelPricing } from './pricing'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CostComparison {
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

/**
 * Count tokens accurately using tiktoken for OpenAI models
 */
export function countTokensWithTiktoken(
  messages: Message[], 
  responseContent: string, 
  model: string = 'gpt-3.5-turbo'
): { inputTokens: number; outputTokens: number } {
  try {
    // Map model names to tiktoken-compatible names
    const tiktokenModel = mapToTiktokenModel(model)
    const encoding = encoding_for_model(tiktokenModel)
    
    // Count input tokens (all messages)
    let inputTokens = 0
    
    // Add tokens per message overhead (varies by model)
    const tokensPerMessage = getTokensPerMessage(tiktokenModel)
    const tokensPerName = getTokensPerName(tiktokenModel)
    
    for (const message of messages) {
      inputTokens += tokensPerMessage
      inputTokens += encoding.encode(message.content).length
      inputTokens += encoding.encode(message.role).length
      if (message.role === 'system') {
        inputTokens += tokensPerName
      }
    }
    
    // Add final message overhead
    inputTokens += 3 // every reply is primed with <|start|>assistant<|message|>
    
    // Count output tokens
    const outputTokens = encoding.encode(responseContent).length
    
    // Free the encoding
    encoding.free()
    
    return { inputTokens, outputTokens }
  } catch (error) {
    console.error('Error counting tokens with tiktoken:', error)
    // Fallback to rough estimation (4 characters = 1 token)
    const inputTokens = messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0)
    const outputTokens = Math.ceil(responseContent.length / 4)
    return { inputTokens, outputTokens }
  }
}

/**
 * Map model names to tiktoken-compatible model names
 */
function mapToTiktokenModel(model: string): 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o' {
  if (model.includes('gpt-4o')) return 'gpt-4o'
  if (model.includes('gpt-4')) return 'gpt-4'
  return 'gpt-3.5-turbo' // default fallback
}

/**
 * Get tokens per message overhead for different models
 */
function getTokensPerMessage(model: string): number {
  if (model.includes('gpt-3.5-turbo')) return 4
  if (model.includes('gpt-4')) return 3
  return 4 // default
}

/**
 * Get tokens per name overhead for different models
 */
function getTokensPerName(model: string): number {
  if (model.includes('gpt-3.5-turbo')) return -1
  if (model.includes('gpt-4')) return 1
  return -1 // default
}

/**
 * Calculate cost comparison between flash model (actual) and OpenAI model (hypothetical)
 */
export async function calculateCostComparison(
  messages: Message[],
  responseContent: string,
  actualFlashModel: string,
  requestedOpenAIModel: string = 'gpt-3.5-turbo',
  actualFlashCost: number
): Promise<CostComparison> {
  try {
    // Get accurate token counts for OpenAI model using tiktoken
    const openaiTokens = countTokensWithTiktoken(messages, responseContent, requestedOpenAIModel)
    
    // Get OpenAI model pricing from database
    const openaiModelPricing = await getOpenAIModelPricing(requestedOpenAIModel)
    
    // Calculate OpenAI costs
    const openaiInputCost = (openaiTokens.inputTokens / 1_000_000) * openaiModelPricing.inputCostPerMillionTokens
    const openaiOutputCost = (openaiTokens.outputTokens / 1_000_000) * openaiModelPricing.outputCostPerMillionTokens
    const openaiTotalCost = openaiInputCost + openaiOutputCost
    
    // Get flash model pricing for display
    const flashModelPricing = await getFlashModelPricing(actualFlashModel)
    
    // Calculate flash model token counts (rough estimation for display)
    const flashInputTokens = messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0)
    const flashOutputTokens = Math.ceil(responseContent.length / 4)
    
    // Calculate savings
    const savingsUsd = Math.max(0, openaiTotalCost - actualFlashCost)
    const savingsPercentage = openaiTotalCost > 0 ? (savingsUsd / openaiTotalCost) * 100 : 0
    
    return {
      flashModel: {
        name: actualFlashModel,
        inputTokens: flashInputTokens,
        outputTokens: flashOutputTokens,
        inputCost: (flashInputTokens / 1_000_000) * flashModelPricing.inputCostPerMillionTokens,
        outputCost: (flashOutputTokens / 1_000_000) * flashModelPricing.outputCostPerMillionTokens,
        totalCost: actualFlashCost
      },
      openaiModel: {
        name: requestedOpenAIModel,
        inputTokens: openaiTokens.inputTokens,
        outputTokens: openaiTokens.outputTokens,
        inputCost: openaiInputCost,
        outputCost: openaiOutputCost,
        totalCost: openaiTotalCost
      },
      savings: {
        absoluteUsd: savingsUsd,
        percentageSaved: savingsPercentage
      }
    }
  } catch (error) {
    console.error('Error calculating cost comparison:', error)
    throw error
  }
}

/**
 * Get OpenAI model pricing from database
 */
async function getOpenAIModelPricing(model: string): Promise<ModelPricing> {
  // Map model names to database entries
  const modelMapping: { [key: string]: { modelName: string, variant?: string | null } } = {
    'gpt-3.5-turbo': { modelName: 'gpt-3.5-turbo', variant: null },
    'gpt-4': { modelName: 'gpt-4', variant: null },
    'gpt-4o': { modelName: 'gpt-4o', variant: null },
    'gpt-4o-mini': { modelName: 'gpt-4o', variant: 'mini' },
    'gpt-4-turbo': { modelName: 'gpt-4', variant: 'turbo' },
    'gpt-4-0125-preview': { modelName: 'gpt-4.1', variant: null },
    'o1-preview': { modelName: 'o1', variant: 'preview' },
    'o1-mini': { modelName: 'o1', variant: 'mini' }
  }
  
  const mapping = modelMapping[model] || { modelName: 'gpt-4o', variant: null }
  
  const pricing = await getSpecificModelPricing('openai', mapping.modelName, mapping.variant)
  if (pricing) return pricing
  
  // Fallback pricing
  return getFallbackPricing('gpt-4o')
}

/**
 * Get flash model pricing from database
 */
async function getFlashModelPricing(model: string): Promise<ModelPricing> {
  // Map flash model names to database entries
  const flashModelMapping: { [key: string]: { provider: string, modelName: string, variant?: string | null } } = {
    'llama-3-70b-8192': { provider: 'groq', modelName: 'llama-3', variant: '70b-8192' },
    'llama-3-8b-8192': { provider: 'groq', modelName: 'llama-3', variant: '8b-8192' },
    'mixtral-8x7b-32768': { provider: 'groq', modelName: 'mixtral', variant: '8x7b-32768' },
    'claude-3-haiku-20240307': { provider: 'anthropic', modelName: 'claude-3', variant: 'haiku' },
    'claude-3.5-haiku': { provider: 'anthropic', modelName: 'claude-3.5', variant: 'haiku' }
  }
  
  const mapping = flashModelMapping[model]
  if (mapping) {
    const pricing = await getSpecificModelPricing(mapping.provider, mapping.modelName, mapping.variant)
    if (pricing) return pricing
  }
  
  // Fallback to Groq Llama-3 70B pricing
  return getFallbackPricing('llama-3-70b')
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.000001) return '$0.000001'
  if (cost < 0.01) return `$${cost.toFixed(6)}`
  if (cost < 1) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(2)}`
}

/**
 * Format savings percentage for display
 */
export function formatSavingsPercentage(percentage: number): string {
  if (percentage < 0.1) return '< 0.1%'
  if (percentage > 99.9) return '> 99%'
  return `${percentage.toFixed(1)}%`
}