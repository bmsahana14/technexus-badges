'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/auth'
import { Award, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await resetPassword(email)
            setSubmitted(true)
            toast.success('Reset link sent to your email!')
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link. Please try again.')
            toast.error(err.message || 'Failed to send reset link')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 mb-8">
                        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-black text-navy-900 mb-4">Check Your Email</h2>
                        <p className="text-gray-600 mb-8">
                            We've sent a password reset link to <span className="font-bold text-navy-900">{email}</span>.
                            Please check your inbox and click the link to continue.
                        </p>
                        <Link href="/auth/signin" className="btn-primary w-full py-4 text-lg font-bold">
                            Return to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <Toaster position="top-right" />
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center justify-center p-4 bg-white rounded-[1.5rem] mb-6 shadow-xl hover:shadow-primary-100 transition-all border border-gray-100">
                        <img src="/logo.png" alt="TechNexus Logo" className="h-20 w-auto object-contain" />
                    </Link>
                    <h1 className="text-4xl font-black text-navy-900 mb-2 uppercase tracking-tight">Reset Password</h1>
                    <p className="text-gray-600">Enter your email to receive a reset link</p>
                </div>

                <div className="card p-8 bg-white shadow-2xl border-none">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3 text-left">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800 font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest text-[10px]">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11 h-14 text-lg"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-14 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold shadow-xl shadow-primary-200"
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        <Link href="/auth/signin" className="inline-flex items-center text-primary-600 font-bold hover:text-primary-700 transition-all">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
