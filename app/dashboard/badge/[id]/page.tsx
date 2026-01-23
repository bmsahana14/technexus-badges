import { supabase } from '@/lib/supabase'
import BadgeClient from './BadgeClient'
import { Metadata } from 'next'

// Generate dynamic metadata for LinkedIn previews
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = await params

    const { data: badge } = await supabase
        .from('badges')
        .select('*')
        .eq('id', id)
        .single()

    if (!badge) return { title: 'Badge Not Found | TechNexus' }

    return {
        title: `TechNexus Credential: ${badge.badge_name}`,
        description: `Certificate for ${badge.badge_name} - ${badge.badge_description}`,
        openGraph: {
            title: `${badge.badge_name} | TechNexus Community`,
            description: badge.badge_description,
            url: `https://technexus-badges-live.vercel.app/dashboard/badge/${id}`,
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
            title: badge.badge_name,
            description: badge.badge_description,
            images: [badge.badge_image_url],
        },
    }
}

export default async function BadgeDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params

    // Fetch badge data on the server
    const { data: badge } = await supabase
        .from('badges')
        .select('*')
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
