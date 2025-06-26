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
    }
  }
} 