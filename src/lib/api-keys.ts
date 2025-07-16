import crypto from 'crypto'
import { createClient } from './supabase-server'

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate a secure random key
  const randomBytes = crypto.randomBytes(32).toString('hex')
  const prefix = 'slp_' // sleipner prefix
  const key = `${prefix}${randomBytes}`
  
  // Create hash for storage
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  
  return { key, hash, prefix }
}

export async function verifyApiKey(apiKey: string): Promise<{ valid: boolean; userId?: string }> {
  try {
    const supabase = await createClient()
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex')
    
    // Use the database function to bypass RLS
    const { data, error } = await supabase
      .rpc('verify_api_key', { api_key_hash: hash })
    
    if (error || !data || data.length === 0) {
      return { valid: false }
    }
    
    const result = data[0]
    
    if (!result.is_valid || !result.user_id) {
      return { valid: false }
    }
    
    // Update last_used_at - we need to do this as the service role
    // or create another function for this
    try {
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('key_hash', hash)
    } catch (updateError) {
      // Log but don't fail verification if update fails
      console.warn('Failed to update last_used_at:', updateError)
    }
    
    return { valid: true, userId: result.user_id }
  } catch (error) {
    console.error('API key verification error:', error)
    return { valid: false }
  }
}

export async function verifyApiKeyById(keyId: string): Promise<{ valid: boolean; userId?: string }> {
  try {
    const supabase = await createClient()
    
    // Look up the API key by ID and verify it's active
    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('id', keyId)
      .eq('is_active', true)
      .single()
    
    if (error || !data) {
      return { valid: false }
    }
    
    // Update last_used_at
    try {
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyId)
    } catch (updateError) {
      console.warn('Failed to update last_used_at:', updateError)
    }
    
    return { valid: true, userId: data.user_id }
  } catch (error) {
    console.error('API key ID verification error:', error)
    return { valid: false }
  }
}

export async function createApiKey(userId: string, name: string) {
  const supabase = await createClient()
  const { key, hash, prefix } = generateApiKey()
  
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name,
      key_hash: hash,
      key_prefix: prefix,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error('Failed to create API key')
  }
  
  return { ...data, key } // Return the full key only once
}

export async function getUserApiKeys(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, created_at, last_used_at, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error('Failed to fetch API keys')
  }
  
  return data
}

export async function deleteApiKey(userId: string, keyId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', userId)
  
  if (error) {
    throw new Error('Failed to delete API key')
  }
} 