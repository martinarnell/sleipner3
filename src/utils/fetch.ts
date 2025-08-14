// Robust fetch with timeout, retries, and exponential backoff
export async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = 3, 
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  const fetchOptions = {
    ...options,
    signal: controller.signal
  }
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions)
      clearTimeout(timeoutId)
      
      // Check if we should retry based on status code
      if (response.status >= 500 || response.status === 429) {
        if (attempt === retries) {
          return response // Return the failed response on final attempt
        }
        
        // Wait with exponential backoff + jitter
        const baseDelay = Math.min(1000 * Math.pow(2, attempt), 10000)
        const jitter = Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, baseDelay + jitter))
        continue
      }
      
      return response
    } catch (error) {
      lastError = error as Error
      clearTimeout(timeoutId)
      
      if (attempt === retries) {
        throw lastError
      }
      
      // Don't retry on abort errors unless it's a timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      
      // Wait with exponential backoff for network errors
      const baseDelay = Math.min(1000 * Math.pow(2, attempt), 10000)
      const jitter = Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, baseDelay + jitter))
    }
  }
  
  throw lastError || new Error('Fetch failed after all retries')
}