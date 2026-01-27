'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signUp, isAdmin, getCurrentUser } from '@/lib/auth'
import { useEffect, Suspense } from 'react'
import { Award, Mail, Lock, AlertCircle, CheckCircle, User, Briefcase } from 'lucide-react'

function SignUpForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextPath = searchParams.get('next')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [designation, setDesignation] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [needsConfirmation, setNeedsConfirmation] = useState(false)
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
            // Not logged in
        } finally {
            setPageLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        try {
            const normalizedEmail = email.trim().toLowerCase()
            const data = await signUp(normalizedEmail, password, {
                first_name: firstName,
                last_name: lastName,
                designation: designation
            })
            setSuccess(true)

            // If Supabase returns a session, they are auto-logged in
            // If not, it means they need to confirm their email
            if (data?.session) {
                setTimeout(() => {
                    const user = data.session.user;
                    if (nextPath) {
                        router.push(nextPath)
                    } else if (isAdmin(user?.email)) {
                        router.push('/admin')
                    } else {
                        router.push('/dashboard')
                    }
                }, 2000)
            } else {
                setNeedsConfirmation(true)
            }
        } catch (err: any) {
            console.error('Sign Up Error:', err)
            setError(err.message || 'Failed to create account. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="card p-8 max-w-md w-full text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2">
                        {needsConfirmation ? 'Check your email!' : 'Account Created!'}
                    </h2>
                    <p className="text-gray-600">
                        {needsConfirmation
                            ? "We've sent a confirmation link to your email. Please click it to activate your account."
                            : 'Redirecting to your dashboard...'}
                    </p>
                    {needsConfirmation && (
                        <Link
                            href="/auth/signin"
                            className="mt-6 btn-primary inline-flex items-center px-6 py-2"
                        >
                            Return to Sign In
                        </Link>
                    )}
                </div>
            </div>
        )
    }

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Award className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center justify-center p-4 bg-white rounded-[1.5rem] mb-4 shadow-xl hover:shadow-primary-100 transition-all border border-gray-100">
                        <img src="/logo.png" alt="TechNexus Logo" className="h-20 w-auto object-contain" />
                    </Link>
                    <h1 className="text-4xl font-black text-navy-900 mb-2 uppercase tracking-tight">Join Today</h1>
                </div>

                {/* Sign Up Form */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    First Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="John"
                                        required
                                        autoComplete="given-name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="Doe"
                                        required
                                        autoComplete="family-name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="designation" className="block text-sm font-semibold text-gray-700 mb-2">
                                Designation
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="designation"
                                    type="text"
                                    value={designation}
                                    onChange={(e) => setDesignation(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Software Engineer"
                                    required
                                    autoComplete="organization-title"
                                />
                            </div>
                        </div>

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
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    required
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    autoComplete="email"
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
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-4 mt-4 select-none active:scale-[0.98] transition-transform font-bold"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Award className="w-6 h-6 animate-spin" />
                                    <span>Creating Account...</span>
                                </div>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center pt-4 border-t border-gray-100">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="text-primary-600 font-semibold hover:text-primary-700">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-gray-600 hover:text-primary-600 text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function SignUp() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Award className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        }>
            <SignUpForm />
        </Suspense>
    )
}
