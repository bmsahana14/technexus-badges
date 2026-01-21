import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
