// Sanitize sensitive data for logging
export function sanitizeForLogging(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data
  }
  
  const sanitized = { ...data as Record<string, unknown> }
  
  // Strip API keys and sensitive headers
  const sensitiveKeys = [
    'authorization', 'x-api-key', 'x-openai-key', 'api-key', 'bearer',
    'groq_key', 'anthropic_key', 'openai_key', 'key', 'token', 'secret'
  ]
  
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
      sanitized[key] = '[REDACTED]'
    }
    
    // Also sanitize nested objects
    if (sanitized[key] && typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key])
    }
  }
  
  return sanitized
}

// Sanitize error messages to avoid leaking keys
export function sanitizeErrorMessage(error: unknown): string {
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