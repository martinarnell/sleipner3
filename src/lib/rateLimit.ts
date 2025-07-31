// Simple in-memory rate limiting for beta signups
// In production, you'd want to use Redis or Upstash for distributed rate limiting

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => rateLimitMap.delete(key))
}, 5 * 60 * 1000)

export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60 * 60 * 1000): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `beta_signup:${ip}`
  
  let entry = rateLimitMap.get(key)
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitMap.set(key, entry)
    
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: entry.resetTime
    }
  }
  
  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }
  
  // Increment count
  entry.count++
  rateLimitMap.set(key, entry)
  
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime
  }
}

// List of common disposable email domains to block
export const disposableEmailDomains = new Set([
  'tempmail.org',
  'tempmail.net', 
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'guerrillamail.info',
  'guerrillamail.biz',
  'guerrillamail.de',
  'grr.la',
  'guerrillamail.net',
  'guerrillamail.org'
])

export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1]
  return disposableEmailDomains.has(domain)
}