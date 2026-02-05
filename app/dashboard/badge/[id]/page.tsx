import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import BadgeClient from './BadgeClient'
import { Metadata } from 'next'
import { headers } from 'next/headers'

// Generate dynamic metadata for LinkedIn previews
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = await params
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://technexus-badges.vercel.app'

    // Use admin client to bypass RLS for scraping
    const { data: badge } = await supabase
        .from('badges')
        .select('*, profiles(first_name, last_name)')
        .eq('id', id)
        .single()

    if (!badge) return { title: 'Badge Not Found | TechNexus' }

    const userName = badge.profiles
        ? `${badge.profiles.first_name || ''} ${badge.profiles.last_name || ''}`.trim()
        : (badge.recipient_email ? badge.recipient_email.split('@')[0] : 'Member');

    return {
        title: `${badge.badge_name} | TechNexus Community Credential`,
        description: `Official digital badge issued to ${userName} by TechNexus Community for earning the "${badge.badge_name}" credential. Verification ID: ${badge.credential_id || 'N/A'}.`,
        openGraph: {
            title: `Credential Earned: ${badge.badge_name}`,
            description: `I am proud to share this official digital achievement from TechNexus Community. This credential verifies my expertise and commitment to excellence in ${badge.badge_name}.`,
            url: `${baseUrl}/dashboard/badge/${id}`,
            siteName: 'TechNexus Community',
            images: [
                {
                    url: badge.badge_image_url,
                    width: 1200,
                    height: 630,
                    alt: badge.badge_name,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `I earned a new badge: ${badge.badge_name}`,
            description: `Official digital credential issued by TechNexus Community.`,
            images: [badge.badge_image_url],
        },
    }
}

export default async function BadgeDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params

    // Fetch badge data using admin client so public can verify tokens via direct link
    const { data: badge } = await supabase
        .from('badges')
        .select('*, profiles(first_name, last_name)')
        .eq('id', id)
        .single()

    if (!badge) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-4xl font-black text-navy-900 mb-4">Badge Not Found</h1>
                <p className="text-gray-600 mb-8 text-xl">The credential you are looking for does not exist or has been revoked.</p>
                <a href="/" className="btn-primary py-3 px-8">Return Home</a>
            </div>
        )
    }

    return <BadgeClient badge={badge} />
}
