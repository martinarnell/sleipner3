import { fetchWithRetry } from './fetch'
import { sanitizeErrorMessage } from './security'

// Question type weights for scoring
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
}

export interface GradingResult {
  score: number
  passed: boolean
  reasoning: string
  cost: number
  timing: {
    duration_ms: number
    api_call_ms: number
    classification_ms: number
    evaluation_ms: number
    start_time: number
    end_time: number
  }
  cost_breakdown: Record<string, unknown>
  threshold: number
  questionType: string
  dimensionScores: Array<{
    dimension: string
    score: number
    reasoning: string
    confidence: number
  }>
  confidence: number
  variance: number
  grader: string
}

// Single-Shot Grading Function (replaces classifyQuestion + evaluateMultiDimensional)
async function gradeResponseOneShot(query: string, response: string, systemContext?: string): Promise<{
  questionType: 'FACTUAL' | 'ANALYTICAL' | 'CREATIVE' | 'TECHNICAL' | 'ETHICAL'
  dimensionScores: Array<{
    dimension: string
    score: number
    reasoning: string
    confidence: number
  }>
  weightedComposite: number
  confidence: number
  variance: number
  threshold: number
  passed: boolean
  cost: number
  timing: number
  cost_breakdown: Record<string, unknown>
}> {
  const startTime = Date.now()
  
  // Fast-path: Skip grading for trivial cases
  const queryTokens = Math.ceil(query.length / 4) // Rough token estimate
  const responseTokens = Math.ceil(response.length / 4)
  
  if (queryTokens < 50 && responseTokens <= 40) {
    // Auto-pass trivial factual questions
    console.log('🚀 Auto-passing trivial question:', query.substring(0, 50))
    return {
      questionType: 'FACTUAL',
      dimensionScores: [
        { dimension: 'accuracy', score: 10, reasoning: 'Auto-pass for trivial factual question', confidence: 1.0 },
        { dimension: 'completeness', score: 10, reasoning: 'Auto-pass for trivial factual question', confidence: 1.0 },
        { dimension: 'safety', score: 10, reasoning: 'Auto-pass for trivial factual question', confidence: 1.0 }
      ],
      weightedComposite: 100, // Perfect score to avoid edge cases
      confidence: 1.0,
      variance: 0,
      threshold: 80,
      passed: true,
      cost: 0, // No API call made
      timing: Date.now() - startTime,
      cost_breakdown: { AUTO_PASS: 0 }
    }
  }
  
  // Use hybrid grading: Llama-3 8B first, GPT-4o-mini for borderline cases
  const openaiApiKey = process.env.OPENAI_FALLBACK_KEY
  const groqApiKey = process.env.GROQ_KEY
  
  if (!openaiApiKey) {
    throw new Error('OPENAI_FALLBACK_KEY environment variable not set')
  }
  if (!groqApiKey) {
    throw new Error('GROQ_KEY environment variable not set')
  }

  // Smart prompt: classify question type within the main grading call to save one round-trip
  // First determine question type based on content patterns
  const queryLower = query.toLowerCase()
  const isLikelyFactual = queryLower.includes('what is') || queryLower.includes('capital of') || 
                         queryLower.includes('when was') || queryLower.includes('who is') ||
                         queryLower.includes('where is') || queryLower.includes('how many')
  
  const isFactual = isLikelyFactual
  
  // Try Llama-3 8B first (fast and cheap)
  try {
    const llamaResult = await gradWithLlama8B(query, response, systemContext, isFactual, groqApiKey)
    
    // Check if Llama-3 8B is confident and passes threshold
    if (llamaResult.confidence >= 0.6 && Math.abs(llamaResult.weightedComposite - llamaResult.threshold) > 3) {
      console.log(`🚀 Llama-3 8B confident: ${llamaResult.weightedComposite}/100 (conf: ${llamaResult.confidence})`)
      return llamaResult
    }
    
    // Borderline case - escalate to GPT-4o-mini
    console.log(`⚠️ Borderline score ${llamaResult.weightedComposite}/100 or low confidence ${llamaResult.confidence}, escalating to GPT-4o-mini`)
    
    const gptResult = await gradeWithGPT4oMini(query, response, systemContext, isFactual, openaiApiKey, startTime)
    
    // Combine costs
    return {
      ...gptResult,
      cost: llamaResult.cost + gptResult.cost,
      timing: Date.now() - startTime,
      cost_breakdown: {
        LLAMA_8B_FIRST_PASS: llamaResult.cost_breakdown.LLAMA_8B_GRADING,
        GPT_4O_MINI_FALLBACK: gptResult.cost_breakdown.ONE_SHOT_GRADING
      }
    }
    
  } catch (llamaError: unknown) {
    const errorMessage = llamaError instanceof Error ? llamaError.message : 'Unknown error'
    console.log(`❌ Llama-3 8B failed, falling back to GPT-4o-mini:`, errorMessage)
    return await gradeWithGPT4oMini(query, response, systemContext, isFactual, openaiApiKey, startTime)
  }
}

// Llama-3 8B grading function (fast first pass)
async function gradWithLlama8B(
  query: string, 
  response: string, 
  systemContext: string | undefined, 
  isFactual: boolean,
  groqApiKey: string
) {
  const startTime = Date.now()
  
  const systemContextSection = systemContext ? `\nSystem Context: "${systemContext}"\n` : ''
  
  const prompt = isFactual ? 
    `Return JSON only. Score this factual response with confidence.

{
  "type": "FACTUAL",
  "scores": {
    "accuracy": 1-10,
    "completeness": 1-10,
    "safety": 1-10
  },
  "reasoning": {
    "accuracy": "<brief explanation>",
    "completeness": "<brief explanation>",
    "safety": "<brief explanation>"
  },
  "confidence": 0.0-1.0
}

Question: """${query}"""${systemContextSection}
Response to Evaluate: """${response}"""

Be confident (0.8+) for clear factual answers, less confident (<0.6) if unsure.` :
    
    `Return JSON only. Classify and score this response with confidence.

{
  "type": "FACTUAL | ANALYTICAL | CREATIVE | TECHNICAL | ETHICAL",
  "scores": {
    "accuracy": 1-10,
    "completeness": 1-10,
    "clarity": 1-10,
    "depth": 1-10,
    "safety": 1-10
  },
  "reasoning": {
    "accuracy": "<brief>",
    "completeness": "<brief>",
    "clarity": "<brief>",
    "depth": "<brief>",
    "safety": "<brief>"
  },
  "confidence": 0.0-1.0
}

Question: """${query}"""${systemContextSection}
Response to Evaluate: """${response}"""

Be confident (0.8+) for clear answers, less confident (<0.6) if complex/ambiguous.`

  const apiResponse = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqApiKey}`
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      max_tokens: isFactual ? 150 : 250,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  }, 3, 1000) // 1s timeout for Groq

  if (!apiResponse.ok) {
    throw new Error(`Llama-3 8B API call failed: ${apiResponse.status}`)
  }

  const data = await apiResponse.json()
  const jsonText = data.choices[0].message.content.trim()
  
  let parsedData
  try {
    parsedData = JSON.parse(jsonText)
  } catch {
    throw new Error('Invalid JSON from Llama-3 8B')
  }

  // Calculate cost - Llama-3 8B pricing: $0.05/1M input, $0.08/1M output
  const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0 }
  const cost = (usage.prompt_tokens * 0.05 / 1000000) + (usage.completion_tokens * 0.08 / 1000000)

  const extractedQuestionType = parsedData.type?.toUpperCase() || (isFactual ? 'FACTUAL' : 'ANALYTICAL')
  const weights = QUESTION_TYPE_WEIGHTS[extractedQuestionType as keyof typeof QUESTION_TYPE_WEIGHTS]
  
  const dimensionScores = isFactual ? [
    { dimension: 'accuracy', score: parsedData.scores?.accuracy || 5, reasoning: parsedData.reasoning?.accuracy || 'N/A', confidence: parsedData.confidence || 0.5 },
    { dimension: 'completeness', score: parsedData.scores?.completeness || 5, reasoning: parsedData.reasoning?.completeness || 'N/A', confidence: parsedData.confidence || 0.5 },
    { dimension: 'safety', score: parsedData.scores?.safety || 5, reasoning: parsedData.reasoning?.safety || 'N/A', confidence: parsedData.confidence || 0.5 }
  ] : [
    { dimension: 'accuracy', score: parsedData.scores?.accuracy || 5, reasoning: parsedData.reasoning?.accuracy || 'N/A', confidence: parsedData.confidence || 0.5 },
    { dimension: 'completeness', score: parsedData.scores?.completeness || 5, reasoning: parsedData.reasoning?.completeness || 'N/A', confidence: parsedData.confidence || 0.5 },
    { dimension: 'clarity', score: parsedData.scores?.clarity || 5, reasoning: parsedData.reasoning?.clarity || 'N/A', confidence: parsedData.confidence || 0.5 },
    { dimension: 'depth', score: parsedData.scores?.depth || 5, reasoning: parsedData.reasoning?.depth || 'N/A', confidence: parsedData.confidence || 0.5 },
    { dimension: 'safety', score: parsedData.scores?.safety || 5, reasoning: parsedData.reasoning?.safety || 'N/A', confidence: parsedData.confidence || 0.5 }
  ]

  const weightedComposite = isFactual ?
    0.6 * dimensionScores[0].score + 0.3 * dimensionScores[1].score + 0.1 * dimensionScores[2].score :
    weights.accuracy * dimensionScores[0].score + weights.completeness * dimensionScores[1].score + 
    weights.clarity * dimensionScores[2].score + weights.depth * dimensionScores[3].score + weights.safety * dimensionScores[4].score

  const scaledWeightedComposite = weightedComposite * 10
  const threshold = isFactual ? 80 : weights.threshold
  const passed = scaledWeightedComposite >= threshold

  return {
    questionType: extractedQuestionType as 'FACTUAL' | 'ANALYTICAL' | 'CREATIVE' | 'TECHNICAL' | 'ETHICAL',
    dimensionScores,
    weightedComposite: Math.round(scaledWeightedComposite * 10) / 10,
    confidence: parsedData.confidence || 0.5,
    variance: 0,
    threshold,
    passed,
    cost,
    timing: Date.now() - startTime,
    cost_breakdown: {
      LLAMA_8B_GRADING: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        cost: cost
      }
    }
  }
}

// GPT-4o-mini grading function (fallback for borderline cases)
async function gradeWithGPT4oMini(
  query: string, 
  response: string, 
  systemContext: string | undefined, 
  isFactual: boolean,
  openaiApiKey: string,
  _originalStartTime: number
) {
  const startTime = Date.now()
  
  const systemContextSection = systemContext ? `\nSystem Context: "${systemContext}"\n` : ''
  
  const prompt = isFactual ? 
    `Return JSON only. Score this factual response carefully.

{
  "type": "FACTUAL",
  "scores": {
    "accuracy": 1-10,
    "completeness": 1-10,
    "safety": 1-10
  },
  "reasoning": {
    "accuracy": "<brief explanation>",
    "completeness": "<brief explanation>",
    "safety": "<brief explanation>"
  },
  "confidence": 0.0-1.0
}

Question: """${query}"""${systemContextSection}
Response to Evaluate: """${response}"""` :
    
    `Return JSON only. Classify and score this response thoroughly.

{
  "type": "FACTUAL | ANALYTICAL | CREATIVE | TECHNICAL | ETHICAL",
  "scores": {
    "accuracy": 1-10,
    "completeness": 1-10,
    "clarity": 1-10,
    "depth": 1-10,
    "safety": 1-10
  },
  "reasoning": {
    "accuracy": "<explanation>",
    "completeness": "<explanation>", 
    "clarity": "<explanation>",
    "depth": "<explanation>",
    "safety": "<explanation>"
  },
  "confidence": 0.0-1.0
}

Question: """${query}"""${systemContextSection}
Response to Evaluate: """${response}"""`

  const apiResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: isFactual ? 200 : 300,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!apiResponse.ok) {
    throw new Error(`GPT-4o-mini API call failed: ${apiResponse.status}`)
  }

  const data = await apiResponse.json()
  const jsonText = data.choices[0].message.content.trim()
  
  let parsedData
  try {
    parsedData = JSON.parse(jsonText)
  } catch {
    throw new Error('Invalid JSON from GPT-4o-mini')
  }

  // Calculate cost - GPT-4o-mini pricing: $0.15/1M input, $0.60/1M output
  const grdU = data.usage ?? { prompt_tokens: 0, completion_tokens: 0 }
  const cost = (grdU.prompt_tokens * 0.15 / 1000000) + (grdU.completion_tokens * 0.60 / 1000000)

  // Validate and extract data
  const extractedQuestionType = parsedData.type?.toUpperCase() || (isFactual ? 'FACTUAL' : 'ANALYTICAL')
  if (!['FACTUAL', 'ANALYTICAL', 'CREATIVE', 'TECHNICAL', 'ETHICAL'].includes(extractedQuestionType)) {
    throw new Error(`Invalid question type: ${extractedQuestionType}`)
  }

  // Get weights for this question type
  const weights = QUESTION_TYPE_WEIGHTS[extractedQuestionType as keyof typeof QUESTION_TYPE_WEIGHTS]
  
  // Build dimension scores array - use slim rubric for FACTUAL, full for others
  const dimensionScores = isFactual ? [
    // Slim rubric for FACTUAL: only accuracy, completeness, safety
    {
      dimension: 'accuracy',
      score: parsedData.scores?.accuracy || 5,
      reasoning: parsedData.reasoning?.accuracy || 'No reasoning provided',
      confidence: parsedData.confidence || 0.8
    },
    {
      dimension: 'completeness',
      score: parsedData.scores?.completeness || 5,
      reasoning: parsedData.reasoning?.completeness || 'No reasoning provided',
      confidence: parsedData.confidence || 0.8
    },
    {
      dimension: 'safety',
      score: parsedData.scores?.safety || 5,
      reasoning: parsedData.reasoning?.safety || 'No reasoning provided',
      confidence: parsedData.confidence || 0.8
    }
  ] : [
    // Full rubric for complex questions
    {
      dimension: 'accuracy',
      score: parsedData.scores?.accuracy || 5,
      reasoning: parsedData.reasoning?.accuracy || 'No reasoning provided',
      confidence: parsedData.confidence || 0.8
    },
    {
      dimension: 'completeness',
      score: parsedData.scores?.completeness || 5,
      reasoning: parsedData.reasoning?.completeness || 'No reasoning provided',
      confidence: parsedData.confidence || 0.8
    },
    {
      dimension: 'clarity',
      score: parsedData.scores?.clarity || 5,
      reasoning: parsedData.reasoning?.clarity || 'No reasoning provided',
      confidence: parsedData.confidence || 0.8
    },
    {
      dimension: 'depth',
      score: parsedData.scores?.depth || 5,
      reasoning: parsedData.reasoning?.depth || 'No reasoning provided',
      confidence: parsedData.confidence || 0.8
    },
    {
      dimension: 'safety',
      score: parsedData.scores?.safety || 5,
      reasoning: parsedData.reasoning?.safety || 'No reasoning provided',
      confidence: parsedData.confidence || 0.8
    }
  ]

  // Calculate weighted composite score
  const weightedComposite = isFactual ?
    // Slim weights for FACTUAL: 60% accuracy, 30% completeness, 10% safety
    0.6 * dimensionScores[0].score + 0.3 * dimensionScores[1].score + 0.1 * dimensionScores[2].score :
    // Full weights for complex questions
    weights.accuracy * dimensionScores[0].score +
    weights.completeness * dimensionScores[1].score +
    weights.clarity * dimensionScores[2].score +
    weights.depth * dimensionScores[3].score +
    weights.safety * dimensionScores[4].score

  // Scale weighted composite from 0-10 to 0-100 to match threshold scale
  const scaledWeightedComposite = weightedComposite * 10

  // Calculate variance
  const avgScore = dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length
  const variance = dimensionScores.reduce((sum, d) => sum + Math.pow(d.score - avgScore, 2), 0) / dimensionScores.length

  // Use lower threshold for FACTUAL questions (80 instead of 85)
  const threshold = isFactual ? 80 : weights.threshold
  const passed = scaledWeightedComposite >= threshold

  return {
    questionType: extractedQuestionType as 'FACTUAL' | 'ANALYTICAL' | 'CREATIVE' | 'TECHNICAL' | 'ETHICAL',
    dimensionScores,
    weightedComposite: Math.round(scaledWeightedComposite * 10) / 10,
    confidence: parsedData.confidence || 0.8,
    variance: Math.round(variance * 10) / 10,
    threshold,
    passed,
    cost,
    timing: Date.now() - startTime,
    cost_breakdown: {
      ONE_SHOT_GRADING: {
        input_tokens: grdU.prompt_tokens,
        output_tokens: grdU.completion_tokens,
        cost: cost
      }
    }
  }
}

// Main grading function (public interface)
export async function gradeResponse(query: string, response: string, systemContext?: string): Promise<GradingResult> {
  const startTime = Date.now()
  
  try {
    // Single API call for classification + evaluation
    const result = await gradeResponseOneShot(query, response, systemContext)
    
    const endTime = Date.now()
    
    return {
      score: result.weightedComposite,
      passed: result.passed,
      reasoning: `GPT-4o-mini grading: ${result.dimensionScores.map(d => `${d.dimension}:${d.score}`).join(', ')}`,
      cost: result.cost,
      timing: {
        duration_ms: endTime - startTime,
        api_call_ms: result.timing,
        classification_ms: 0, // No longer separate
        evaluation_ms: result.timing, // Single call handles both
        start_time: startTime,
        end_time: endTime
      },
      cost_breakdown: result.cost_breakdown,
      threshold: result.threshold,
      questionType: result.questionType,
      dimensionScores: result.dimensionScores,
      confidence: result.confidence,
      variance: result.variance,
      grader: 'gpt-4o-mini-optimized'
    }
  } catch (error) {
    console.error('One-shot grading error:', sanitizeErrorMessage(error))
    const errorEndTime = Date.now()
    const fallbackTiming = errorEndTime - startTime
    return {
      score: 50, // 50/100 - middle of the road fallback score
      passed: false,
      reasoning: 'One-shot grading failed',
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
      grader: 'gpt-4o-mini-fallback'
    }
  }
}