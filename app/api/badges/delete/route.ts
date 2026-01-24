import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'


const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

export async function DELETE(request: NextRequest) {
    try {
        // 1. Verify admin token
        const authHeader = request.headers.get('Authorization')
        const token = authHeader?.split(' ')[1]

        if (!token || token === 'undefined') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check against admin list
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'bmsahana14@gmail.com').split(',').map(e => e.trim().toLowerCase())
        if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('badges')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Badge deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
