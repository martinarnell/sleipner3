import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface ModelPricing {
  provider: string
  modelName: string
  modelVariant: string | null
  inputCostPerMillionTokens: number
  outputCostPerMillionTokens: number
  cachedInputCostPerMillionTokens: number | null
  contextWindowTokens: number
  notes?: string
}

// In-memory cache for pricing data
const pricingCache = new Map<string, { data: ModelPricing[], timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Get model pricing from database with 24h caching
 */
export async function getModelPricing(provider?: string, modelName?: string): Promise<ModelPricing[]> {
  const cacheKey = `${provider || 'all'}-${modelName || 'all'}`
  
  // Check cache first
  const cached = pricingCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    let query = supabase
      .from('ai_provider_pricing')
      .select(`
        provider,
        model_name,
        model_variant,
        input_cost_per_million_tokens,
        output_cost_per_million_tokens,
        cached_input_cost_per_million_tokens,
        context_window_tokens,
        notes
      `)
      .order('provider')
      .order('model_name')
      .order('model_variant')

    if (provider) {
      query = query.eq('provider', provider)
    }

    if (modelName) {
      query = query.eq('model_name', modelName)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching pricing data:', error)
      return []
    }

    const pricing: ModelPricing[] = (data || []).map(row => ({
      provider: row.provider,
      modelName: row.model_name,
      modelVariant: row.model_variant,
      inputCostPerMillionTokens: Number(row.input_cost_per_million_tokens),
      outputCostPerMillionTokens: Number(row.output_cost_per_million_tokens),
      cachedInputCostPerMillionTokens: row.cached_input_cost_per_million_tokens 
        ? Number(row.cached_input_cost_per_million_tokens) 
        : null,
      contextWindowTokens: row.context_window_tokens,
      notes: row.notes
    }))

    // Cache the result
    pricingCache.set(cacheKey, {
      data: pricing,
      timestamp: Date.now()
    })

    return pricing
  } catch (error) {
    console.error('Error in getModelPricing:', error)
    return []
  }
}

/**
 * Get specific model pricing by provider and model identifiers
 */
export async function getSpecificModelPricing(
  provider: string, 
  modelName: string, 
  modelVariant?: string | null
): Promise<ModelPricing | null> {
  const allPricing = await getModelPricing(provider, modelName)
  
  return allPricing.find(p => 
    p.provider === provider && 
    p.modelName === modelName && 
    p.modelVariant === modelVariant
  ) || null
}

/**
 * Calculate cost for tokens using model pricing
 */
export function calculateCost(
  pricing: ModelPricing,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens = 0
): number {
  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPerMillionTokens
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPerMillionTokens
  
  let cachedInputCost = 0
  if (cachedInputTokens > 0 && pricing.cachedInputCostPerMillionTokens) {
    cachedInputCost = (cachedInputTokens / 1_000_000) * pricing.cachedInputCostPerMillionTokens
  }
  
  return inputCost + outputCost + cachedInputCost
}

/**
 * Get fallback pricing for models not in database
 */
export function getFallbackPricing(modelName: string): ModelPricing {
  // Fallback pricing based on model patterns
  if (modelName.includes('gpt-4')) {
    return {
      provider: 'openai',
      modelName: 'gpt-4',
      modelVariant: null,
      inputCostPerMillionTokens: 30.0,
      outputCostPerMillionTokens: 60.0,
      cachedInputCostPerMillionTokens: null,
      contextWindowTokens: 8192,
      notes: 'Fallback pricing for GPT-4 variants'
    }
  }
  
  if (modelName.includes('claude')) {
    return {
      provider: 'anthropic',
      modelName: 'claude-3',
      modelVariant: 'haiku',
      inputCostPerMillionTokens: 0.25,
      outputCostPerMillionTokens: 1.25,
      cachedInputCostPerMillionTokens: null,
      contextWindowTokens: 200000,
      notes: 'Fallback pricing for Claude variants'
    }
  }
  
  if (modelName.includes('llama')) {
    return {
      provider: 'groq',
      modelName: 'llama-3',
      modelVariant: '70b-8192',
      inputCostPerMillionTokens: 0.59,
      outputCostPerMillionTokens: 0.79,
      cachedInputCostPerMillionTokens: null,
      contextWindowTokens: 8192,
      notes: 'Fallback pricing for Llama variants'
    }
  }

  // Default fallback
  return {
    provider: 'unknown',
    modelName: 'unknown',
    modelVariant: null,
    inputCostPerMillionTokens: 1.0,
    outputCostPerMillionTokens: 2.0,
    cachedInputCostPerMillionTokens: null,
    contextWindowTokens: 4096,
    notes: 'Default fallback pricing'
  }
}

/**
 * Get pricing for grader models specifically
 */
export async function getGraderModelPricing(graderModel?: string): Promise<ModelPricing> {
  // Map grader model names to database entries
  const graderModelMapping: { [key: string]: { provider: string, modelName: string, variant?: string | null } } = {
    'claude-3-haiku-20240307': { provider: 'anthropic', modelName: 'claude-3-haiku-20240307', variant: null },
    'claude-haiku': { provider: 'anthropic', modelName: 'claude-3', variant: 'haiku' },
    'gpt-4o-mini': { provider: 'openai', modelName: 'gpt-4o-mini', variant: 'grader' },
    'gpt-3.5-turbo': { provider: 'openai', modelName: 'gpt-3.5-turbo', variant: 'grader' },
    'llama-3-8b': { provider: 'groq', modelName: 'llama-3', variant: '8b-grader' },
    'mixtral-8x7b': { provider: 'groq', modelName: 'mixtral', variant: '8x7b-grader' }
  }
  
  const modelKey = graderModel || 'claude-3-haiku-20240307' // Default to current grader
  const mapping = graderModelMapping[modelKey]
  
  if (mapping) {
    const pricing = await getSpecificModelPricing(mapping.provider, mapping.modelName, mapping.variant)
    if (pricing) return pricing
  }
  
  // Fallback to Claude Haiku pricing for grading
  return getFallbackPricing('claude-3-haiku')
}

/**
 * Get cost-effective grader alternatives
 */
export async function getGraderAlternatives(): Promise<ModelPricing[]> {
  const alternatives = await getModelPricing()
  return alternatives.filter(pricing => 
    pricing.notes?.includes('GRADER') || 
    pricing.modelVariant?.includes('grader')
  ).sort((a, b) => a.inputCostPerMillionTokens - b.inputCostPerMillionTokens)
}

/**
 * Clear pricing cache (useful for testing or forced refresh)
 */
export function clearPricingCache(): void {
  pricingCache.clear()
}