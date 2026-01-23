import { supabase } from './supabase'

export async function signUp(email: string, password: string, metadata: { first_name: string, last_name: string, designation: string }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002')

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
            emailRedirectTo: `${appUrl}/auth/signin`
        }
    })

    if (error) throw error
    return data
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error
    return data
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
}

export async function resetPassword(email: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002')
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/update-password`,
    })
    if (error) throw error
    return data
}

export function isAdmin(email: string | undefined) {
    if (!email) return false
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'bmsahana14@gmail.com'
    const adminList = adminEmails.split(',').map(e => e.trim().toLowerCase())

    // Always include your main email as a fallback
    if (!adminList.includes('bmsahana14@gmail.com')) {
        adminList.push('bmsahana14@gmail.com')
    }

    return adminList.includes(email.toLowerCase())
}
