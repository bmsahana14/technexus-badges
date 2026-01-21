'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast, Toaster } from 'react-hot-toast'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Award, Loader2, Send, Mail, Image as ImageIcon, Briefcase, Upload, X } from 'lucide-react'

export default function IssueBadgePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [form, setForm] = useState({
        user_email: '',
        badge_name: '',
        badge_description: '',
        event_name: '',
        badge_image_url: '',
    })

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const user = await getCurrentUser()
            if (!user || !isAdmin(user.email)) {
                router.push('/auth/signin')
                toast.error('Access denied. Administrator privileges required.')
                return
            }
            setPageLoading(false)
        } catch (error) {
            router.push('/auth/signin')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let finalImageUrl = form.badge_image_url

            // 1. Handle File Upload if exists
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Math.round(Date.now() / 1000)}-${Math.random().toString(36).substring(7)}.${fileExt}`

                const formData = new FormData()
                formData.append('file', imageFile)
                formData.append('fileName', fileName)

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!uploadRes.ok) {
                    const uploadData = await uploadRes.json()
                    throw new Error(uploadData.error || 'Failed to upload image')
                }

                const { publicUrl } = await uploadRes.json()
                finalImageUrl = publicUrl
            }

            // 2. Create the badge in Database
            const res = await fetch('/api/badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    badge_image_url: finalImageUrl
                }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to create badge')

            // 3. Send the email notification
            const emailRes = await fetch('/api/send-badge-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to_email: form.user_email,
                    badge_name: form.badge_name,
                    event_name: form.event_name,
                    badge_link: `${window.location.origin}/dashboard`
                }),
            })

            if (!emailRes.ok) {
                toast.error('Badge created, but email failed to send')
            } else {
                toast.success('Badge issued successfully and email sent!')
            }

            // Reset form
            setForm({
                user_email: '',
                badge_name: '',
                badge_description: '',
                event_name: '',
                badge_image_url: '',
            })
            setImageFile(null)
            setImagePreview(null)

        } catch (error: any) {
            toast.error(error.message)
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <Toaster position="top-right" />

            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <Link href="/admin" className="inline-flex items-center justify-center p-2 bg-white rounded-xl mb-4 shadow-md">
                        <img src="/logo.png" alt="TechNexus Logo" className="w-16 h-16 object-contain" />
                    </Link>
                    <h1 className="text-3xl font-bold text-navy-900">Issue TechNexus Badge</h1>
                    <p className="text-gray-600 mt-2">Distribute credentials to community members</p>
                </div>

                <div className="card p-8 bg-white shadow-xl border-none">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recipient Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Recipient Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="user_email"
                                        value={form.user_email}
                                        onChange={handleChange}
                                        required
                                        className="input-field pl-11"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            {/* Badge Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Badge Name
                                </label>
                                <div className="relative">
                                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="badge_name"
                                        value={form.badge_name}
                                        onChange={handleChange}
                                        required
                                        className="input-field pl-11"
                                        placeholder="e.g. Workshop Excellence"
                                    />
                                </div>
                            </div>

                            {/* Event Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Event / Category
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="event_name"
                                        value={form.event_name}
                                        onChange={handleChange}
                                        required
                                        className="input-field pl-11"
                                        placeholder="e.g. Web Development 2026"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="badge_description"
                                value={form.badge_description}
                                onChange={handleChange}
                                rows={3}
                                className="input-field"
                                placeholder="Describe the achievement..."
                            />
                        </div>

                        {/* Badge Design (Image) */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">
                                Badge Design
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Upload Box */}
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center
                                        ${imagePreview ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 h-40'}`}
                                >
                                    {imagePreview ? (
                                        <div className="relative group w-full h-full flex items-center justify-center">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="max-h-32 object-contain rounded-lg shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={clearImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500 font-medium">Click to upload custom design</span>
                                            <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col justify-center text-center md:text-left">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Or Use URL</span>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="url"
                                            name="badge_image_url"
                                            value={form.badge_image_url}
                                            onChange={handleChange}
                                            disabled={!!imageFile}
                                            className="input-field pl-11 text-sm bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="https://example.com/badge.png"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">
                                        Custom upload takes priority over URL.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-14 flex items-center justify-center space-x-2 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-6 h-6" />
                                    <span>Issue Badge</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/admin')}
                        className="text-gray-500 hover:text-primary-600 font-medium transition-all duration-200 flex items-center justify-center mx-auto group"
                    >
                        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                        Back to Admin Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}
