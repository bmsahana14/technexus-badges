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
    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
            if (error.message.includes('refresh_token_not_found') || error.status === 400) {
                return null
            }
            throw error
        }
        return user
    } catch (err) {
        return null
    }
}

export async function getSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
            if (error.message.includes('refresh_token_not_found') || error.status === 400) {
                return null
            }
            throw error
        }
        return session
    } catch (err) {
        return null
    }
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

    // Include main admin emails as fallbacks
    const fallbacks = ['bmsahana14@gmail.com', 'mrazee3814@gmail.com']
    fallbacks.forEach(email => {
        if (!adminList.includes(email)) {
            adminList.push(email)
        }
    })

    return adminList.includes(email.toLowerCase())
}
