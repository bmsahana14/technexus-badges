'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, isAdmin, getCurrentUser } from '@/lib/auth'
import { useEffect, Suspense } from 'react'
import { Award, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'

function SignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextPath = searchParams.get('next')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)

    useEffect(() => {
        checkSession()
    }, [])

    const checkSession = async () => {
        try {
            const user = await getCurrentUser()
            if (user) {
                if (isAdmin(user.email)) {
                    router.push('/admin')
                } else {
                    router.push('/dashboard')
                }
                return
            }
        } catch (err) {
            // Not logged in, stay on page
        } finally {
            setPageLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const trimmedEmail = email.trim()
            await signIn(trimmedEmail, password)

            // Check if user is admin and redirect accordingly
            if (nextPath) {
                router.push(nextPath)
            } else if (isAdmin(trimmedEmail)) {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                < Award className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center p-2 bg-white rounded-xl mb-4 shadow-md hover:shadow-lg transition-shadow">
                        <img src="/logo.png" alt="TechNexus Logo" className="w-16 h-16 object-contain" />
                    </Link>
                    <h1 className="text-3xl font-bold text-navy-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">to TechNexus Community</p>
                </div>

                {/* Sign In Form */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="text-primary-600 font-semibold hover:text-primary-700">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-sm">
                    <Link href="/" className="text-gray-500 hover:text-primary-600 transition-colors">
                        ← Back to Home
                    </Link>
                    <Link href="/admin" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center">
                        Admin Portal <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function SignIn() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                < Award className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        }>
            <SignInForm />
        </Suspense>
    )
}
