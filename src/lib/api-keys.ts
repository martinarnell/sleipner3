const crypto = require('crypto')

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate a random API key
  const key = `sk_${crypto.randomBytes(32).toString('hex')}`
  
  // Create a hash for storage (never store the actual key)
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  
  // Create a prefix for display (first 8 characters + ...)
  const prefix = `${key.substring(0, 12)}...`
  
  return { key, hash, prefix }
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export function validateApiKeyFormat(key: string): boolean {
  // Check if the key starts with 'sk_' and has the right length
  return key.startsWith('sk_') && key.length === 67 // 'sk_' + 64 hex characters
}