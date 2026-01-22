import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            user_email,
            badge_name,
            badge_description,
            event_name,
            badge_image_url
        } = body

        // Validate required fields
        if (!user_email || !badge_name || !event_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Find user by email in profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', user_email.toLowerCase())
            .single()

        // Create badge - link to profile if found, otherwise keep email for claiming
        const { data: badge, error: badgeError } = await supabase
            .from('badges')
            .insert({
                user_id: profile?.id || null,
                recipient_email: profile ? null : user_email.toLowerCase(),
                badge_name,
                badge_description: badge_description || '',
                badge_image_url: badge_image_url || '',
                event_name,
                issued_date: new Date().toISOString(),
            })
            .select()
            .single()

        if (badgeError) {
            console.error('DATABASE ERROR creating badge:', badgeError)
            return NextResponse.json(
                {
                    error: 'Failed to create badge',
                    details: badgeError,
                    message: badgeError.message
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            badge,
            message: profile ? 'Badge created successfully' : 'Badge created and pending user registration',
            requires_registration: !profile
        })

    } catch (error: any) {
        console.error('Badge creation error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            )
        }

        const { data: badges, error } = await supabase
            .from('badges')
            .select('*')
            .eq('user_id', userId)
            .order('issued_date', { ascending: false })

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch badges' },
                { status: 500 }
            )
        }

        return NextResponse.json({ badges })

    } catch (error: any) {
        console.error('Badge fetch error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
