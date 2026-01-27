'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Award, Calendar, Shield, Share2, Download, Linkedin, ArrowLeft, CheckCircle, ExternalLink, Hash } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import type { Badge } from '@/lib/supabase'

export default function BadgeClient({ badge }: { badge: Badge }) {
    const handleDownload = async () => {
        try {
            const response = await fetch(badge.badge_image_url, { mode: 'cors' })
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${badge.badge_name.replace(/\s+/g, '_')}_Certificate.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Download started!')
        } catch (err) {
            window.open(badge.badge_image_url, '_blank')
        }
    }

    const shareToLinkedIn = () => {
        const badgeUrl = window.location.href
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(badgeUrl)}`
        window.open(linkedinUrl, '_blank', 'width=600,height=600')
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast.success('Link copied to clipboard!')
        })
    }



    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <Toaster position="top-right" />

            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 font-bold">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="hover:opacity-80 transition-all flex-shrink-0">
                            <img src="/logo.png" alt="TechNexus Logo" className="h-10 sm:h-14 w-auto object-contain" />
                        </Link>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                        <Link href="/dashboard" className="hidden sm:flex items-center text-gray-500 hover:text-primary-600 transition-colors text-sm">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            <span>Return to Dashboard</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link href="/auth/signup" className="hidden xs:block text-xs sm:text-sm font-semibold text-gray-600 hover:text-primary-600">
                            Join Community
                        </Link>
                        <Link href="/dashboard" className="btn-primary py-2 px-4 shadow-md text-xs sm:text-sm">
                            My Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 pt-10">
                <div className="text-center mb-8">
                    <p className="text-primary-600 font-black uppercase tracking-[0.2em] text-sm mb-2">Member's Achievement</p>
                    <div className="h-1 w-20 bg-primary-600 mx-auto rounded-full"></div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Badge Image Side */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-primary-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6">
                                <Shield className="w-10 h-10 text-primary-200" />
                            </div>

                            <div className="aspect-square relative flex items-center justify-center bg-gradient-to-br from-primary-50 to-white rounded-2xl overflow-hidden shadow-inner border border-primary-50">
                                {badge.badge_image_url ? (
                                    <Image
                                        src={badge.badge_image_url}
                                        alt={badge.badge_name}
                                        fill
                                        className="object-contain p-8 transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <Award className="w-32 h-32 text-primary-200" />
                                )}
                            </div>

                            <div className="mt-8 flex justify-center space-x-4">
                                <button
                                    onClick={handleDownload}
                                    className="btn-primary space-x-2 py-3 px-8 shadow-lg shadow-primary-200 flex-1 flex items-center justify-center font-bold"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Download Certificate</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-navy-900">Verified Web3 Credential</h4>
                                <p className="text-sm text-blue-800 opacity-80">
                                    This achievement is verified by TechNexus Community and can be shared globally.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Badge Info Side */}
                    <div className="space-y-8">
                        <div>
                            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                                Outstanding Achievement
                            </span>
                            <h1 className="text-4xl font-black text-navy-900 leading-tight mb-4 uppercase">
                                {badge.badge_name}
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed italic">
                                "{badge.badge_description}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-center text-gray-400 mb-2">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Issued</span>
                                </div>
                                <p className="font-bold text-navy-800">
                                    {new Date(badge.issued_date).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-center text-gray-400 mb-2">
                                    <Hash className="w-4 h-4 mr-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">ID</span>
                                </div>
                                <p className="text-xs font-mono font-black text-primary-600 truncate uppercase">
                                    {badge.credential_id || 'TN-PENDING'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center text-gray-400 mb-4">
                                <Award className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Authority</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-white border border-gray-100 p-2 rounded-xl shadow-sm">
                                        <img src="/logo.png" alt="TechNexus" className="w-6 h-6 object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-navy-900">TechNexus Community</p>
                                        <p className="text-[10px] text-green-600 font-bold">● VERIFIED ORGANIZATION</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <h4 className="font-bold text-navy-900 mb-4 uppercase text-[10px] tracking-widest text-gray-400">Share Your Achievement</h4>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={shareToLinkedIn}
                                        className="flex items-center space-x-2 py-4 px-8 bg-[#0077B5] text-white rounded-2xl hover:bg-[#005c8d] transition-all font-bold shadow-xl shadow-blue-100 flex-1 justify-center active:scale-95"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                        <span>Post to Feed</span>
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center space-x-2 py-4 px-8 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-bold flex-1 justify-center active:scale-95"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span>Copy Direct Link</span>
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center italic">
                                    Note: LinkedIn previews may take a few minutes to update after issuance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
