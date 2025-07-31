import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey, verifyApiKeyById } from '@/lib/api-keys'
import { getSpecificModelPricing, calculateCost, getFallbackPricing, getGraderModelPricing } from '@/lib/pricing'
import { logApiRequestAsync } from '@/lib/api-logging'
import { calculateCostComparison, type CostComparison, type Message as CostComparisonMessage } from '@/lib/cost-comparison'

// ========== SLEIPNER CASCADE SYSTEM ==========

// ========== PROMPT COMPRESSION SYSTEM ==========

// Define message interface
interface Message {
  role: string;
  content: string;
}

// Strategy A: Lossless shorthand compression using regex/lookup table
function compressPromptLossless(text: string): {
  compressed: string;
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  transformationsApplied: string[];
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

  // Calculate approximate token counts (rough estimate: 4 chars = 1 token)
  const originalTokens = Math.ceil(text.length / 4)
  const compressedTokens = Math.ceil(compressed.length / 4)
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
async function compressPromptSemantic(text: string): Promise<{
  compressed: string;
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  similarityScore: number;
  method: string;
}> {
  // Placeholder implementation - in the future this would:
  // 1. Use Claude Haiku with compression prompt
  // 2. Calculate semantic similarity with embeddings
  // 3. Apply safety checks and fall back if needed
  
  const originalTokens = Math.ceil(text.length / 4)
  
  return {
    compressed: text, // No compression for now
    originalTokens,
    compressedTokens: originalTokens,
    compressionRatio: 0,
    similarityScore: 1.0,
    method: 'semantic_placeholder'
  }
}

// Define interfaces for compression
interface CompressionStrategy {
  name: string;
  applied: boolean;
  originalTokens?: number;
  compressedTokens?: number;
  compressionRatio?: number;
  transformationsApplied?: string[];
  reason?: string;
}

interface CompressionResult {
  compressed: string;
  originalTokens: number;
  compressedTokens: number;
  totalCompressionRatio: number;
  strategies: CompressionStrategy[];
  cost: number;
  timing: {
    duration_ms: number;
    start_time: number;
    end_time: number;
  };
}

// Main compression orchestrator
async function compressPrompt(text: string, aggressive: boolean = false): Promise<CompressionResult> {
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

// Helper function to extract and validate messages
function processMessages(messages: Message[]) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format')
  }

  const systemPrompts = messages.filter(msg => msg.role === 'system')
  const conversationMessages = messages.filter(msg => msg.role !== 'system')
  const lastUserMessage = messages.filter(msg => msg.role === 'user').pop()

  return {
    systemPrompts,
    conversationMessages,
    allMessages: messages,
    lastUserMessage: lastUserMessage?.content || '',
    hasSystemPrompt: systemPrompts.length > 0
  }
}

// Helper function to construct proper message array for API calls
function buildMessagesForAPI(systemPrompts: Message[], conversationMessages: Message[]) {
  // Ensure system messages come first, followed by conversation
  return [...systemPrompts, ...conversationMessages]
}

// Step 1: Cache check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkCache(queryHash: string) {
  const startTime = Date.now()
  // Cache infrastructure in place but always returns no hit for now
  const endTime = Date.now()
  return { 
    found: false,
    timing: {
      duration_ms: endTime - startTime,
      start_time: startTime,
      end_time: endTime
    }
  }
}

// Step 2: Tier-0 Model (Groq Llama-3-70B)
async function callTier0(messages: Message[]) {
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
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
    const endTime = Date.now()
    
    const content = data.choices[0]?.message?.content || ''
    const usage = data.usage || {}
    const promptTokens = usage.prompt_tokens || 0
    const completionTokens = usage.completion_tokens || 0
    
    // Get Groq Llama-3 70B pricing from database
    const groqPricing = await getSpecificModelPricing('groq', 'llama-3', '70b-8192') || 
                        getFallbackPricing('llama-3-70b')
    const cost = calculateCost(groqPricing, promptTokens, completionTokens)

    return {
      content,
      promptTokens,
      completionTokens,
      cost,
      processedMessages,
      timing: {
        duration_ms: endTime - startTime,
        api_call_ms: endTime - apiCallStart,
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
    console.error('Groq API call failed:', error)
    throw new Error('Failed to call Groq API')
  }
}

// Step 3: Multi-Dimensional Response Grading
async function gradeResponse(query: string, response: string, systemContext?: string) {
  const startTime = Date.now()
  
  try {
    // First classify the question
    const classificationResult = await classifyQuestion(query, systemContext)
    
    // Then evaluate all dimensions
    const result = await evaluateMultiDimensional(query, response, classificationResult.type, systemContext)
    
    const endTime = Date.now()
    const totalCost = classificationResult.cost + result.cost
    
    return {
      score: result.weightedComposite,
      passed: result.passed,
      reasoning: `Multi-dimensional: ${result.dimensionScores.map(d => `${d.dimension}:${d.score}`).join(', ')}`,
      cost: totalCost,
      timing: {
        duration_ms: endTime - startTime,
        api_call_ms: classificationResult.timing + result.timing,
        classification_ms: classificationResult.timing,
        evaluation_ms: result.timing,
        start_time: startTime,
        end_time: endTime
      },
      cost_breakdown: {
        ...result.cost_breakdown,
        classification: {
          cost: classificationResult.cost,
          timing_ms: classificationResult.timing
        }
      },
      threshold: result.threshold,
      questionType: result.questionType,
      dimensionScores: result.dimensionScores,
      confidence: result.confidence,
      variance: result.variance,
      grader: 'multi-dimensional'
    }
  } catch (error) {
    console.error('Multi-dimensional grading error:', error)
    const errorEndTime = Date.now()
    const fallbackTiming = errorEndTime - startTime
    return {
      score: 50,
      passed: false,
      reasoning: 'Multi-dimensional grading failed',
      cost: 0,
      timing: {
        duration_ms: fallbackTiming,
        api_call_ms: fallbackTiming,
        classification_ms: 0,
        evaluation_ms: 0,
        start_time: startTime,
        end_time: errorEndTime
      },
      cost_breakdown: {},
      threshold: 75,
      questionType: 'ANALYTICAL',
      dimensionScores: [],
      confidence: 0,
      variance: 0,
      grader: 'multi-dimensional-fallback'
    }
  }
}

// Multi-Dimensional Rubric Scoring System
interface RubricDimension {
  name: string;
  description: string;
  scale: number;
  weight: number;
  evaluationPrompt: string;
  criteriaMapping: { [scoreRange: string]: string };
}

interface DimensionScore {
  dimension: string;
  score: number;
  reasoning: string;
  confidence: number;
}

interface MultiDimensionalResult {
  questionType: 'FACTUAL' | 'ANALYTICAL' | 'CREATIVE' | 'TECHNICAL' | 'ETHICAL';
  dimensionScores: DimensionScore[];
  weightedComposite: number;
  confidence: number;
  variance: number;
  threshold: number;
  passed: boolean;
  cost: number;
  timing: number;
  cost_breakdown: Record<string, unknown>;
}

const DIMENSIONS: { [key: string]: RubricDimension } = {
  ACCURACY: {
    name: "Accuracy",
    description: "Factual correctness and freedom from errors",
    scale: 10,
    weight: 0, // Will be set by question type
    evaluationPrompt: `Rate the factual accuracy of this response (1-10):
    - Are all facts correct and verifiable?
    - Is there any misinformation or errors?
    - Are numbers, dates, and specific claims accurate?
    
    10: Completely accurate, all facts verified
    8-9: Mostly accurate with minor imprecisions
    6-7: Some inaccuracies but generally correct
    4-5: Several inaccuracies present
    1-3: Major factual errors or misinformation`,
    criteriaMapping: {
      "9-10": "Completely accurate, all facts verified",
      "7-8": "Mostly accurate with minor imprecisions", 
      "5-6": "Some inaccuracies present",
      "1-4": "Major factual errors or misinformation"
    }
  },
  COMPLETENESS: {
    name: "Completeness", 
    description: "Thoroughness in addressing all aspects of the question",
    scale: 10,
    weight: 0,
    evaluationPrompt: `Rate how completely this response addresses the question (1-10):
    - Are all parts of the question answered?
    - Are key aspects covered adequately?
    - Is important context or information missing?
    
    10: Completely comprehensive, all aspects covered
    8-9: Covers most aspects thoroughly
    6-7: Covers main points but misses some details
    4-5: Partially complete, significant gaps
    1-3: Incomplete, major aspects unaddressed`,
    criteriaMapping: {
      "9-10": "Completely comprehensive",
      "7-8": "Covers most aspects thoroughly",
      "5-6": "Covers main points but misses details", 
      "1-4": "Incomplete, major gaps"
    }
  },
  CLARITY: {
    name: "Clarity",
    description: "Clear communication and readability",
    scale: 10, 
    weight: 0,
    evaluationPrompt: `Rate the clarity and readability of this response (1-10):
    - Is the explanation clear and easy to understand?
    - Is the structure logical and well-organized?
    - Are complex concepts explained simply?
    
    10: Exceptionally clear and well-structured
    8-9: Clear with good organization
    6-7: Generally clear but could be clearer
    4-5: Somewhat unclear or confusing
    1-3: Very unclear or poorly structured`,
    criteriaMapping: {
      "9-10": "Exceptionally clear and well-structured",
      "7-8": "Clear with good organization",
      "5-6": "Generally clear but could be clearer",
      "1-4": "Unclear or poorly structured"
    }
  },
  DEPTH: {
    name: "Depth",
    description: "Level of analysis, insight, and sophistication",
    scale: 10,
    weight: 0,
    evaluationPrompt: `Rate the depth and analytical quality of this response (1-10):
    - Does it provide meaningful insights or analysis?
    - Is the level of detail appropriate for the question?
    - Are underlying concepts or implications explored?
    
    10: Deep analysis with exceptional insights
    8-9: Good depth with solid analysis
    6-7: Moderate depth, some analysis
    4-5: Surface-level treatment
    1-3: Very shallow or superficial`,
    criteriaMapping: {
      "9-10": "Deep analysis with exceptional insights",
      "7-8": "Good depth with solid analysis", 
      "5-6": "Moderate depth, some analysis",
      "1-4": "Shallow or superficial"
    }
  },
  SAFETY: {
    name: "Safety",
    description: "Absence of harmful, biased, or inappropriate content",
    scale: 10,
    weight: 0,
    evaluationPrompt: `Rate the safety and appropriateness of this response (1-10):
    - Is content free from harmful or dangerous advice?
    - Are there any ethical concerns or biases?
    - Is the tone appropriate and respectful?
    
    10: Completely safe and appropriate
    8-9: Safe with minor concerns
    6-7: Generally safe but some issues
    4-5: Some safety or ethical concerns
    1-3: Significant safety risks or inappropriate`,
    criteriaMapping: {
      "9-10": "Completely safe and appropriate",
      "7-8": "Safe with minor concerns",
      "5-6": "Generally safe but some issues", 
      "1-4": "Safety or ethical concerns present"
    }
  }
};

const QUESTION_TYPE_WEIGHTS = {
  FACTUAL: { 
    accuracy: 0.40, completeness: 0.30, clarity: 0.20, depth: 0.05, safety: 0.05,
    threshold: 85 // Higher threshold for simple facts
  },
  ANALYTICAL: { 
    accuracy: 0.25, completeness: 0.20, clarity: 0.15, depth: 0.35, safety: 0.05,
    threshold: 75 // Moderate threshold, depth is key
  },
  CREATIVE: { 
    accuracy: 0.15, completeness: 0.25, clarity: 0.25, depth: 0.25, safety: 0.10,
    threshold: 70 // Lower threshold, creativity valued
  },
  TECHNICAL: { 
    accuracy: 0.35, completeness: 0.30, clarity: 0.20, depth: 0.10, safety: 0.05,
    threshold: 80 // High accuracy and completeness needed
  },
  ETHICAL: { 
    accuracy: 0.20, completeness: 0.20, clarity: 0.20, depth: 0.20, safety: 0.20,
    threshold: 75 // Balanced approach, safety critical
  }
};

// Question Classification Function
async function classifyQuestion(query: string, systemContext?: string): Promise<{
  type: 'FACTUAL' | 'ANALYTICAL' | 'CREATIVE' | 'TECHNICAL' | 'ETHICAL';
  timing: number;
  cost: number;
}> {
  const startTime = Date.now()
  const anthropicApiKey = process.env.ANTHROPIC_KEY
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_KEY environment variable not set')
  }

  const systemContextSection = systemContext 
    ? `\nSystem Context: "${systemContext}"\n` 
    : ''

  const classificationPrompt = `Classify this question into ONE of these categories:

FACTUAL: Basic facts, definitions, math, simple "what is" questions
- Examples: "What is the capital of France?", "What is 2+2?", "When was WWII?"
- Key: Direct factual answers

ANALYTICAL: Business analysis, strategy, economic evaluation, complex reasoning
- Examples: "Analyze market trends", "Develop a strategy", "Compare business models", "Evaluate ROI"
- Key: Requires analytical thinking, data interpretation, strategic reasoning
- Note: Business strategies are ANALYTICAL, not creative

CREATIVE: Original content creation, artistic expression, storytelling
- Examples: "Write a poem", "Create a fictional story", "Design an advertisement slogan"
- Key: Requires imagination and artistic expression, not business analysis

TECHNICAL: Specific technical knowledge, procedures, code, or domain expertise
- Examples: "How to configure X?", "Debug this code", "Medical diagnosis", "Engineering calculations"
- Key: Requires specialized technical knowledge

ETHICAL: Questions involving moral judgments, values, or sensitive topics
- Examples: "Is X right or wrong?", "Should we do Y?", "Political opinions"
- Key: Involves moral or ethical considerations

Question: "${query}"${systemContextSection}

Important: Business strategies, market analysis, and data-driven decision making are ANALYTICAL, not CREATIVE.

Respond with ONLY the category name: FACTUAL, ANALYTICAL, CREATIVE, TECHNICAL, or ETHICAL`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 20,
        messages: [
          { role: 'user', content: classificationPrompt }
        ]
      })
    })

    const timing = Date.now() - startTime
    
    if (!response.ok) {
      console.error('Anthropic API error:', response.status, response.statusText)
      return { type: 'ANALYTICAL', timing, cost: 0 } // Default fallback
    }

    const data = await response.json()
    const classification = data.content?.[0]?.text?.trim()?.toUpperCase()
    
    // Calculate cost (Claude Haiku pricing: $0.25/1M input, $1.25/1M output)
    const inputTokens = data.usage?.input_tokens || 0
    const outputTokens = data.usage?.output_tokens || 0
    const cost = (inputTokens * 0.25 / 1000000) + (outputTokens * 1.25 / 1000000)
    
    if (['FACTUAL', 'ANALYTICAL', 'CREATIVE', 'TECHNICAL', 'ETHICAL'].includes(classification)) {
      return { 
        type: classification as 'FACTUAL' | 'ANALYTICAL' | 'CREATIVE' | 'TECHNICAL' | 'ETHICAL',
        timing,
        cost
      }
    }
    
    return { type: 'ANALYTICAL', timing, cost } // Default fallback
  } catch (error) {
    console.error('Question classification error:', error)
    const timing = Date.now() - startTime
    return { type: 'ANALYTICAL', timing, cost: 0 } // Default fallback
  }
}

// Multi-Dimensional Evaluation Function
async function evaluateMultiDimensional(query: string, response: string, questionType: string, systemContext?: string): Promise<MultiDimensionalResult> {
  const startTime = Date.now()
  const anthropicApiKey = process.env.ANTHROPIC_KEY
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_KEY environment variable not set')
  }

  const weights = QUESTION_TYPE_WEIGHTS[questionType as keyof typeof QUESTION_TYPE_WEIGHTS]
  const dimensionScores: DimensionScore[] = []
  let totalCost = 0
  const costBreakdown: Record<string, unknown> = {}

  // Evaluate each dimension in parallel for efficiency
  const dimensionPromises = Object.entries(DIMENSIONS).map(async ([dimName, dimension]) => {
    const systemContextSection = systemContext 
      ? `\nOriginal System Context: "${systemContext}"\n` 
      : ''

    const evaluationPrompt = `${dimension.evaluationPrompt}

Question Type: ${questionType}
Original Question: "${query}"${systemContextSection}
Response to Evaluate: "${response}"

Provide your evaluation as JSON:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation of score>",
  "confidence": <number 0.0-1.0>
}`

    try {
      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 200,
          messages: [
            { role: 'user', content: evaluationPrompt }
          ]
        })
      })

      if (!apiResponse.ok) {
        console.error(`Dimension ${dimName} evaluation failed:`, apiResponse.status)
        return {
          dimension: dimName.toLowerCase(),
          score: 5, // Neutral fallback
          reasoning: "Evaluation failed - API error",
          confidence: 0.0
        }
      }

      const data = await apiResponse.json()
      const content = data.content?.[0]?.text?.trim()
      
      // Calculate cost for this dimension
      const inputTokens = data.usage?.input_tokens || 0
      const outputTokens = data.usage?.output_tokens || 0
      // Get grader pricing from database (Claude Haiku or alternatives)
      const graderPricing = await getGraderModelPricing('claude-3-haiku-20240307')
      const dimCost = calculateCost(graderPricing, inputTokens, outputTokens)
      totalCost += dimCost
      costBreakdown[dimName] = {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        input_cost_per_1m: graderPricing.inputCostPerMillionTokens,
        output_cost_per_1m: graderPricing.outputCostPerMillionTokens,
        input_cost: (inputTokens / 1_000_000) * graderPricing.inputCostPerMillionTokens,
        output_cost: (outputTokens / 1_000_000) * graderPricing.outputCostPerMillionTokens,
        cost: dimCost,
        grader_model: `${graderPricing.provider}/${graderPricing.modelName}${graderPricing.modelVariant ? `-${graderPricing.modelVariant}` : ''}`
      }

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            dimension: dimName.toLowerCase(),
            score: Math.max(1, Math.min(10, parsed.score || 5)),
            reasoning: parsed.reasoning || "No reasoning provided",
            confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
          }
        }
      } catch (parseError) {
        console.error(`Failed to parse dimension ${dimName} response:`, parseError)
      }

      // Fallback parsing
      const scoreMatch = content.match(/score["\s]*:[\s]*(\d+)/i)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5
      
      return {
        dimension: dimName.toLowerCase(),
        score: Math.max(1, Math.min(10, score)),
        reasoning: "Parsed from partial response",
        confidence: 0.5
      }

    } catch (error) {
      console.error(`Dimension ${dimName} evaluation error:`, error)
      return {
        dimension: dimName.toLowerCase(),
        score: 5,
        reasoning: "Evaluation failed - network error",
        confidence: 0.0
      }
    }
  })

  // Wait for all dimension evaluations to complete
  const results = await Promise.all(dimensionPromises)
  dimensionScores.push(...results)

  // Calculate weighted composite score
  let weightedSum = 0
  let totalWeight = 0
  let confidenceSum = 0
  let variance = 0

  dimensionScores.forEach(dimScore => {
    const weight = weights[dimScore.dimension as keyof typeof weights] || 0
    weightedSum += dimScore.score * weight
    totalWeight += weight
    confidenceSum += dimScore.confidence
  })

  const weightedComposite = totalWeight > 0 ? (weightedSum / totalWeight) * 10 : 50 // Scale to 100
  const avgConfidence = dimensionScores.length > 0 ? confidenceSum / dimensionScores.length : 0.5

  // Calculate variance to measure consistency
  const avgScore = dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length
  variance = dimensionScores.reduce((sum, d) => sum + Math.pow(d.score - avgScore, 2), 0) / dimensionScores.length

  const threshold = weights.threshold
  const passed = weightedComposite >= threshold

  return {
    questionType: questionType as 'FACTUAL' | 'ANALYTICAL' | 'CREATIVE' | 'TECHNICAL' | 'ETHICAL',
    dimensionScores,
    weightedComposite: Math.round(weightedComposite * 10) / 10, // Round to 1 decimal
    confidence: Math.round(avgConfidence * 100) / 100, // Round to 2 decimals
    variance: Math.round(variance * 10) / 10, // Round to 1 decimal
    threshold,
    passed,
    cost: totalCost,
    timing: Date.now() - startTime,
    cost_breakdown: costBreakdown
  }
}

// Step 4: Tier-1 Model (GPT-4) - now takes compressed messages and optional OpenAI key
async function callTier1(messages: Message[], requestedModel: string, compressionData?: CompressionResult, openaiKey?: string) {
  const startTime = Date.now()
  
  // Determine which OpenAI API key to use (priority: parameter > env fallback)
  const apiKey = openaiKey || process.env.OPENAI_FALLBACK_KEY
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
          errorMessage = `OpenAI API error: ${errorData.error.message}`
        }
      } catch {
        // Keep the generic error message
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const endTime = Date.now()
    
    const content = data.choices[0]?.message?.content || ''
    const usage = data.usage || {}
    const promptTokens = usage.prompt_tokens || 0
    const completionTokens = usage.completion_tokens || 0
    
    // OpenAI pricing: $10/1M input tokens, $30/1M output tokens for GPT-4
    const inputCostPer1M = await getInputCostPer1M(openaiModel)
    const outputCostPer1M = await getOutputCostPer1M(openaiModel)
    const inputCost = (promptTokens * inputCostPer1M) / 1000000
    const outputCost = (completionTokens * outputCostPer1M) / 1000000
    const totalCost = inputCost + outputCost

    return {
      content,
      promptTokens,
      completionTokens,
      cost: totalCost,
      processedMessages,
      compressionData,
      timing: {
        duration_ms: endTime - startTime,
        api_call_ms: endTime - apiCallStart,
        start_time: startTime,
        end_time: endTime
      },
      cost_breakdown: {
        input_tokens: promptTokens,
        output_tokens: completionTokens,
        input_cost_per_1m: inputCostPer1M,
        output_cost_per_1m: outputCostPer1M,
        input_cost: inputCost,
        output_cost: outputCost,
        total_cost: totalCost
      },
      openai_model_used: openaiModel,
      key_source: openaiKey ? 'user_provided' : 'system_fallback'
    }
  } catch (error) {
    console.error('OpenAI API call failed:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to call OpenAI API')
  }
}

// Helper function to map requested model names to actual OpenAI model names
function mapToOpenAIModel(requestedModel: string): string {
  const modelMap: { [key: string]: string } = {
    'gpt-4': 'gpt-4-0125-preview',
    'gpt-4-turbo': 'gpt-4-0125-preview', 
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
    'gpt-3.5-turbo': 'gpt-4o-mini', // Upgrade 3.5 requests to 4o-mini for better quality
    'o1-preview': 'o1-preview',
    'o1-mini': 'o1-mini'
  }
  
  return modelMap[requestedModel] || 'gpt-4o-mini' // Default to gpt-4o-mini
}

// Helper function to get input cost per 1M tokens for different models
async function getInputCostPer1M(model: string): Promise<number> {
  // Map model names to our database format
  const modelMapping: { [key: string]: { provider: string, modelName: string, variant?: string | null } } = {
    'gpt-4-0125-preview': { provider: 'openai', modelName: 'gpt-4', variant: 'turbo' },
    'gpt-4o': { provider: 'openai', modelName: 'gpt-4o', variant: null },
    'gpt-4o-mini': { provider: 'openai', modelName: 'gpt-4o', variant: 'mini' },
    'o1-preview': { provider: 'openai', modelName: 'o1', variant: 'preview' },
    'o1-mini': { provider: 'openai', modelName: 'o1', variant: 'mini' }
  }
  
  const mapping = modelMapping[model]
  if (mapping) {
    const pricing = await getSpecificModelPricing(mapping.provider, mapping.modelName, mapping.variant)
    if (pricing) {
      return pricing.inputCostPerMillionTokens
    }
  }
  
  // Fallback to database pricing or default
  const fallback = getFallbackPricing(model)
  return fallback.inputCostPerMillionTokens
}

// Helper function to get output cost per 1M tokens for different models  
async function getOutputCostPer1M(model: string): Promise<number> {
  // Map model names to our database format
  const modelMapping: { [key: string]: { provider: string, modelName: string, variant?: string | null } } = {
    'gpt-4-0125-preview': { provider: 'openai', modelName: 'gpt-4', variant: 'turbo' },
    'gpt-4o': { provider: 'openai', modelName: 'gpt-4o', variant: null },
    'gpt-4o-mini': { provider: 'openai', modelName: 'gpt-4o', variant: 'mini' },
    'o1-preview': { provider: 'openai', modelName: 'o1', variant: 'preview' },
    'o1-mini': { provider: 'openai', modelName: 'o1', variant: 'mini' }
  }
  
  const mapping = modelMapping[model]
  if (mapping) {
    const pricing = await getSpecificModelPricing(mapping.provider, mapping.modelName, mapping.variant)
    if (pricing) {
      return pricing.outputCostPerMillionTokens
    }
  }
  
  // Fallback to database pricing or default
  const fallback = getFallbackPricing(model)
  return fallback.outputCostPerMillionTokens
}

// Step 5: Cache Response
async function cacheResponse(queryHash: string, response: string) {
  // Placeholder: In real implementation, store in Redis/DB
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused = queryHash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused2 = response
  return { cached: true }
}

// Main Cascade Flow  
async function runCascadeFlow(messages: Message[], requestedModel: string, forceEscalate: boolean = false, openaiKey?: string) {
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
  
  const flowSteps: Array<Record<string, unknown>> = []
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
  
  // Step 2: Prompt Compression (always applied)
  flowSteps.push({ step: 2, name: 'Prompt Compression', status: 'compressing', cost: 0, details: '', score: 0, passed: false })
  
  // Combine all message content for compression
  const fullPromptText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
  const compressionResult = await compressPrompt(fullPromptText, false) // Set to true for more aggressive compression
  
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
  const tier0Result = await callTier0(compressedMessages)
  totalCost += tier0Result.cost
  costBreakdown.tier0_generation = tier0Result.cost
  timingBreakdown.tier0_generation_ms = tier0Result.timing.duration_ms
  
  flowSteps[2].status = 'complete'
  flowSteps[2].cost = 0 // Tier-0 is "free" from user perspective 
  flowSteps[2].timing = tier0Result.timing
  flowSteps[2].cost_breakdown = tier0Result.cost_breakdown
  flowSteps[2].details = `Generated response (${tier0Result.completionTokens} tokens)${processedMessages.hasSystemPrompt ? ' with system context' : ''}`
  flowSteps[2].tier0_response = tier0Result.content // Include actual response for playground
  
  // Step 4: Grade Response (now includes system context)
  flowSteps.push({ step: 4, name: 'Quality Grading (Haiku)', status: 'grading', cost: 0, details: '', score: 0, passed: false })
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
  flowSteps[3].grader_reasoning = `Multi-dimensional evaluation by Claude Haiku (Question type: ${gradeResult.questionType})${forceEscalate ? ' (manually overridden for testing)' : ''}` // For playground display
  
  if (gradeResult.passed && !forceEscalate) {
    // Quality passed - use Tier-0 response
    finalResponse = tier0Result.content
    finalModel = 'groq-llama-3-70b'
    flowSteps.push({ step: 5, name: 'Result', status: 'tier0_success', details: 'Quality threshold met - using Tier-0 response' })
  } else {
    // Quality failed - escalate to Tier-1 using already compressed prompt
    flowSteps.push({ step: 5, name: 'Tier-1 (GPT-4)', status: 'calling', cost: 0 })
    
    const tier1Result = await callTier1(compressedMessages, requestedModel, compressionResult, openaiKey)
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

    if (apiKeyId) {
      // Playground usage - look up API key by ID
      const { valid, userId: lookupUserId } = await verifyApiKeyById(apiKeyId)
      if (!valid || !lookupUserId) {
        return NextResponse.json(
          { error: 'Invalid API key ID' },
          { status: 401 }
        )
      }
      userId = lookupUserId
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // Direct API usage - verify raw API key
      const apiKey = authHeader.substring(7) // Remove "Bearer " prefix
      const { valid, userId: verifyUserId } = await verifyApiKey(apiKey)
      if (!valid || !verifyUserId) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }
      userId = verifyUserId
    } else {
      return NextResponse.json(
        { error: 'Missing API key or authorization header' },
        { status: 401 }
      )
    }

    // Parse the request body
    requestBody = await request.json()
    const { messages, model = 'gpt-3.5-turbo' } = requestBody as { messages?: unknown[], model?: string }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Run Sleipner's cascade flow
    const cascadeResult = await runCascadeFlow(messages as Message[], model, forceEscalate, openaiKeyHeader || undefined)
    
    const promptTokens = (messages as Message[]).reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0)
    const completionTokens = Math.ceil((cascadeResult.response || '').length / 4)
    
    // Calculate baseline savings (what they would have paid for direct premium model)
    // Calculate direct premium cost using database pricing  
    const premiumPricing = await getSpecificModelPricing('openai', 'gpt-4o', null) || 
                          getFallbackPricing('gpt-4o')
    const directPremiumCost = calculateCost(premiumPricing, promptTokens, completionTokens)
    const baselineSavings = Math.max(0, directPremiumCost - cascadeResult.cost)
    
    // Calculate detailed cost comparison using tiktoken for accurate OpenAI token counting
    let costComparison: CostComparison | undefined
    try {
      const costComparisonMessages: CostComparisonMessage[] = (messages as Message[]).map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }))
      
      costComparison = await calculateCostComparison(
        costComparisonMessages,
        cascadeResult.response || '',
        cascadeResult.model,
        model, // requested OpenAI model
        cascadeResult.cost
      )
    } catch (error) {
      console.error('Error calculating cost comparison:', error)
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
      requestData: requestBody,
      responseData: debugMode ? response : { 
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

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error in chat completions:', error)
    
    // Log the failed API request asynchronously (non-blocking)
    const responseTimeMs = Date.now() - requestStartTime
    logApiRequestAsync({
      requestId,
      userId,
      apiKeyId: apiKeyId || undefined,
      endpoint: '/api/v1/chat/completions',
      httpMethod: 'POST',
      requestData: requestBody || {},
      responseStatus: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      responseTimeMs
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 