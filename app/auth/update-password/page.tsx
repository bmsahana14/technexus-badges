'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Award, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

export default function UpdatePassword() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            toast.success('Password updated successfully!')
            setTimeout(() => {
                router.push('/auth/signin')
            }, 3000)
        } catch (err: any) {
            setError(err.message || 'Failed to update password')
            toast.error(err.message || 'Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 mb-8">
                        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-black text-navy-900 mb-4">Password Set!</h2>
                        <p className="text-gray-600 mb-8">
                            Your password has been successfully updated. Redirecting you to the sign-in page...
                        </p>
                        <Link href="/auth/signin" className="btn-primary w-full py-4 text-lg font-bold">
                            Go to Sign In Now
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
                    <h1 className="text-4xl font-black text-navy-900 mb-2 uppercase tracking-tight">Set New Password</h1>
                    <p className="text-gray-600">Enter your new secure password below</p>
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
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest text-[10px]">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 h-14 text-lg"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest text-[10px]">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field pl-11 h-14 text-lg"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-14 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold shadow-xl shadow-primary-200"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
