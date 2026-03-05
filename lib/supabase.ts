import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Card = {
  id: string
  user_id: string
  name: string
  series: string
  card_type: 'pokemon' | 'topps'
  purchase_price: number
  purchase_date: string | null
  is_signed: boolean
  is_numbered: boolean
  numbering: string | null
  is_special: boolean
  quantity: number
  main_image_url: string | null
  images: string[] | null
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
