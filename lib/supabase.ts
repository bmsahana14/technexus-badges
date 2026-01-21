import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a dummy client or actual client depending on if variables exist
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as any) // Build-time fallback

export type Badge = {
    id: string
    user_id: string
    badge_name: string
    badge_description: string
    badge_image_url: string
    issued_date: string
    event_name: string
    created_at: string
}

export type User = {
    id: string
    email: string
    created_at: string
}
