import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const fileName = formData.get('fileName') as string

        if (!file || !fileName) {
            return NextResponse.json({ error: 'File and fileName are required' }, { status: 400 })
        }

        // Upload to storage using service role (bypasses RLS)
        const { data, error } = await supabase.storage
            .from('badge-images')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: true
            })

        if (error) {
            console.error('Storage Error:', error)
            if (error.message.includes('bucket not found')) {
                return NextResponse.json({
                    error: 'Storage bucket "badge-images" not found. Please create it in your Supabase Dashboard > Storage.'
                }, { status: 500 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('badge-images')
            .getPublicUrl(fileName)

        return NextResponse.json({ publicUrl })
    } catch (error: any) {
        console.error('Upload API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
