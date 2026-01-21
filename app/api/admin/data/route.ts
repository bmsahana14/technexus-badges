import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
    try {
        // 1. Verify the user is authenticated and is an admin
        const authHeader = request.headers.get('Authorization')
        const token = authHeader?.split(' ')[1]

        if (!token || token === 'undefined') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check against admin email list
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

        console.log('Admin Check - User Email:', user.email)
        console.log('Admin Check - Admin Emails List:', adminEmails)
        console.log('Admin Check - Is Admin:', adminEmails.includes(user.email?.toLowerCase() || ''))

        if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
            console.log('Admin Check - FORBIDDEN: User email not in admin list')
            return NextResponse.json({
                error: 'Forbidden - Admin access required',
                debug: {
                    userEmail: user.email,
                    adminEmails: adminEmails
                }
            }, { status: 403 })
        }

        // 2. Fetch all badges with user profile info using ADMIN client
        const { data: badges, error: badgeError } = await supabaseAdmin
            .from('badges')
            .select(`
                *,
                profiles (
                    first_name,
                    last_name,
                    designation,
                    email
                )
            `)
            .order('created_at', { ascending: false })

        if (badgeError) throw badgeError

        return NextResponse.json({ badges })

    } catch (error: any) {
        console.error('Admin Data API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
