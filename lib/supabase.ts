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
  club?: string | null
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

export type Wish = {
  id: string
  user_id: string
  name: string
  series: string
  card_type: 'pokemon' | 'topps'
  club?: string | null
  is_signed: boolean
  is_numbered: boolean
  numbering: string | null
  is_special: boolean
  link_url: string
  created_at: string
  updated_at: string
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined'

export type FriendRequest = {
  id: string
  requester_id: string
  receiver_id: string
  status: FriendRequestStatus
  created_at: string
  responded_at: string | null
}

export type Friend = {
  id: string
  user_id: string
  friend_id: string
  friend_username: string
  created_at: string
}

export type NotificationType = 'friend_request'

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  payload: any
  is_read: boolean
  created_at: string
}

export type Profile = {
  id: string
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
