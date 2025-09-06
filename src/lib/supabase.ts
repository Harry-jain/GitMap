import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface UserHistory {
  id: string
  user_id: string
  repo_url: string
  repo_name: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      user_history: {
        Row: UserHistory
        Insert: Omit<UserHistory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserHistory, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}