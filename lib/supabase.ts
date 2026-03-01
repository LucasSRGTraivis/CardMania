import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Card = {
  id: string
  user_id: string
  name: string
  set_name: string
  card_number: string
  rarity: string
  condition: string
  quantity: number
  image_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
