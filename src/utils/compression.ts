import { countTokens } from './token-counting'

// Define interfaces for compression
export interface CompressionStrategy {
  name: string
  applied: boolean
  reason?: string
  originalTokens?: number
  compressedTokens?: number
  compressionRatio?: number
  transformationsApplied?: string[]
}

export interface CompressionResult {
  compressed: string
  originalTokens: number
  compressedTokens: number
  totalCompressionRatio: number
  strategies: CompressionStrategy[]
  cost: number
  timing: {
    duration_ms: number
    start_time: number
    end_time: number
  }
}

// Strategy A: Lossless shorthand compression using regex/lookup table
export function compressPromptLossless(text: string): {
  compressed: string
  originalTokens: number
  compressedTokens: number
  compressionRatio: number
  transformationsApplied: string[]
} {
  const transformations: string[] = []
  let compressed = text

  // Lookup table for common phrase replacements
  const phraseReplacements = [
    { from: /\bfor example\b/gi, to: 'e.g.', desc: 'for example → e.g.' },
    { from: /\bthat is\b/gi, to: 'i.e.', desc: 'that is → i.e.' },
    { from: /\bin other words\b/gi, to: 'i.e.', desc: 'in other words → i.e.' },
    { from: /\bplease note that\b/gi, to: 'note:', desc: 'please note that → note:' },
    { from: /\bit is important to\b/gi, to: 'importantly,', desc: 'it is important to → importantly,' },
    { from: /\bcan you please\b/gi, to: 'please', desc: 'can you please → please' },
    { from: /\bwould you please\b/gi, to: 'please', desc: 'would you please → please' },
    { from: /\bcould you please\b/gi, to: 'please', desc: 'could you please → please' }
  ]

  // Apply phrase replacements
  for (const replacement of phraseReplacements) {
    const beforeCount = (compressed.match(replacement.from) || []).length
    compressed = compressed.replace(replacement.from, replacement.to)
    if (beforeCount > 0) {
      transformations.push(`${replacement.desc} (${beforeCount}x)`)
    }
  }

  // Remove pleasantries and filler words
  const fillerPatterns = [
    { from: /\b(hello|hi|hey)\s+(there|friend)?\s*[,!]?\s*/gi, to: '', desc: 'removed greetings' },
    { from: /\b(thank you|thanks)\s+(so much|very much)?\s*[,!]?\s*/gi, to: '', desc: 'removed thanks' },
    { from: /\b(please and thank you|thanks in advance)\s*[,!]?\s*/gi, to: '', desc: 'removed pleasantries' },
    { from: /\b(um|uh|hmm|well)\s+/gi, to: '', desc: 'removed filler words' }
  ]

  for (const pattern of fillerPatterns) {
    const beforeCount = (compressed.match(pattern.from) || []).length
    compressed = compressed.replace(pattern.from, pattern.to)
    if (beforeCount > 0) {
      transformations.push(`${pattern.desc} (${beforeCount}x)`)
    }
  }

  // Normalize whitespace and bullet points
  const whitespacePatterns = [
    { from: /\s{2,}/g, to: ' ', desc: 'normalized multiple spaces' },
    { from: /\n\s*\n\s*\n+/g, to: '\n\n', desc: 'normalized multiple newlines' },
    { from: /^\s+|\s+$/gm, to: '', desc: 'trimmed line whitespace' },
    { from: /•\s*/g, to: '• ', desc: 'normalized bullet points' },
    { from: /-\s{2,}/g, to: '- ', desc: 'normalized dash bullets' }
  ]

  for (const pattern of whitespacePatterns) {
    const before = compressed
    compressed = compressed.replace(pattern.from, pattern.to)
    if (before !== compressed) {
      transformations.push(pattern.desc)
    }
  }

  // Calculate accurate token counts using tiktoken
  const originalTokens = countTokens(text)
  const compressedTokens = countTokens(compressed)
  const compressionRatio = originalTokens > 0 ? (originalTokens - compressedTokens) / originalTokens : 0

  return {
    compressed: compressed.trim(),
    originalTokens,
    compressedTokens,
    compressionRatio,
    transformationsApplied: transformations
  }
}

// Strategy B: Semantic compression (placeholder for ML-powered compression)
export async function compressPromptSemantic(text: string): Promise<{
  compressed: string
  originalTokens: number
  compressedTokens: number
  compressionRatio: number
  similarityScore: number
  method: string
}> {
  // Placeholder implementation - in the future this would:
  // 1. Use Claude Haiku with compression prompt
  // 2. Calculate semantic similarity with embeddings
  // 3. Apply safety checks and fall back if needed
  
  const originalTokens = countTokens(text)
  
  return {
    compressed: text, // No compression for now
    originalTokens,
    compressedTokens: originalTokens,
    compressionRatio: 0,
    similarityScore: 1.0,
    method: 'semantic_placeholder'
  }
}

// Main compression orchestrator
export async function compressPrompt(text: string, aggressive: boolean = false): Promise<CompressionResult> {
  const startTime = Date.now()
  const strategies: CompressionStrategy[] = []
  const cost = 0

  // Always apply Strategy A (lossless)
  const losslessResult = compressPromptLossless(text)
  strategies.push({
    name: 'lossless_shorthand',
    applied: true,
    ...losslessResult
  })

  let finalCompressed = losslessResult.compressed
  let finalTokens = losslessResult.compressedTokens

  // Apply Strategy B (semantic) if text is long enough and aggressive mode is enabled
  const shouldApplySemantic = aggressive && losslessResult.compressedTokens > 1000
  
  if (shouldApplySemantic) {
    const semanticResult = await compressPromptSemantic(finalCompressed)
    strategies.push({
      name: 'semantic_summarize',
      applied: true,
      ...semanticResult
    })
    
    // For now, semantic doesn't change anything since it's a placeholder
    finalCompressed = semanticResult.compressed
    finalTokens = semanticResult.compressedTokens
  } else {
    strategies.push({
      name: 'semantic_summarize',
      applied: false,
      reason: shouldApplySemantic ? 'disabled' : 'text_too_short'
    })
  }

  const endTime = Date.now()
  const totalCompressionRatio = losslessResult.originalTokens > 0 
    ? (losslessResult.originalTokens - finalTokens) / losslessResult.originalTokens 
    : 0

  return {
    compressed: finalCompressed,
    originalTokens: losslessResult.originalTokens,
    compressedTokens: finalTokens,
    totalCompressionRatio,
    strategies,
    cost, // No cost for lossless, small cost for semantic when implemented
    timing: {
      duration_ms: endTime - startTime,
      start_time: startTime,
      end_time: endTime
    }
  }
}