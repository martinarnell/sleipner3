import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          created_at: string
          last_used_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          created_at?: string
          last_used_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          created_at?: string
          last_used_at?: string | null
          is_active?: boolean
        }
      }
      beta_leads: {
        Row: {
          id: string
          email: string
          company: string | null
          ip: string | null
          user_agent: string | null
          source: string | null
          ai_service: string | null
          monthly_spend: string | null
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          company?: string | null
          ip?: string | null
          user_agent?: string | null
          source?: string | null
          ai_service?: string | null
          monthly_spend?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          company?: string | null
          ip?: string | null
          user_agent?: string | null
          source?: string | null
          ai_service?: string | null
          monthly_spend?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
      }
    }
  }
} 