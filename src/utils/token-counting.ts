import { get_encoding } from '@dqbd/tiktoken'

export interface Message {
  role: string
  content: string
}

// Token counting utility - uses accurate tiktoken implementation
export function countTokens(text: string): number {
  try {
    const encoding = get_encoding("cl100k_base")
    const tokens = encoding.encode(text).length
    encoding.free()
    return tokens
  } catch (error) {
    console.error('Token counting failed, falling back to approximation:', sanitizeErrorMessage(error))
    // Fallback to length/4 if tiktoken fails
    return Math.ceil(text.length / 4)
  }
}

// Helper to count tokens with message formatting overhead
export function countTokensWithOverhead(messages: Message[], responseContent = ''): { inputTokens: number; outputTokens: number } {
  try {
    // Convert to cost-comparison format and use their robust counting
    const costMessages = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    }))
    
    // Import the robust token counting from cost-comparison
    const encoding = get_encoding("cl100k_base")
    
    // Count input tokens with proper message overhead
    let inputTokens = 0
    const tokensPerMessage = 3 // <|start|>{role/name}\n{content}<|end|>\n
    
    for (const message of costMessages) {
      inputTokens += tokensPerMessage
      inputTokens += encoding.encode(message.content).length
      inputTokens += encoding.encode(message.role).length
    }
    inputTokens += 3 // reply priming tokens
    
    const outputTokens = encoding.encode(responseContent).length
    encoding.free()
    
    return { inputTokens, outputTokens }
  } catch (error) {
    console.error('Message token counting failed, falling back to approximation:', sanitizeErrorMessage(error))
    const inputTokens = messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0)
    const outputTokens = Math.ceil(responseContent.length / 4)
    return { inputTokens, outputTokens }
  }
}

// Import sanitizeErrorMessage for error logging
function sanitizeErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error'
  
  let message = error instanceof Error ? error.message : String(error)
  
  // Pattern to match potential API keys (various formats)
  const keyPatterns = [
    /sk-[a-zA-Z0-9]{32,}/g,  // OpenAI style
    /xai-[a-zA-Z0-9-]{32,}/g, // Anthropic style
    /gsk_[a-zA-Z0-9]{32,}/g,  // Groq style
    /[a-zA-Z0-9]{32,64}/g     // Generic long alphanumeric strings
  ]
  
  for (const pattern of keyPatterns) {
    message = message.replace(pattern, '[API_KEY_REDACTED]')
  }
  
  return message
}