import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

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
