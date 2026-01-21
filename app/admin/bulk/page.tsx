'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast, Toaster } from 'react-hot-toast'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { Award, Loader2, Send, Mail, Briefcase, Upload, X, Download, FileJson, CheckCircle2, AlertCircle } from 'lucide-react'

interface BulkRequest {
    email: string
    badge_name: string
    event_name: string
    description?: string
    status: 'pending' | 'processing' | 'success' | 'error'
    message?: string
}

export default function BulkIssuePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [bulkData, setBulkData] = useState<BulkRequest[]>([])
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const user = await getCurrentUser()
            if (!user || !isAdmin(user.email)) {
                router.push('/auth/signin')
                return
            }
            setPageLoading(false)
        } catch (error) {
            router.push('/auth/signin')
        }
    }

    const downloadTemplate = () => {
        const headers = 'email,badge_name,event_name,description\n'
        const sampleData = 'user1@example.com,Technical Mentor,Web Workshop 2026,Awarded for exceptional mentorship\nuser2@example.com,Top Contributor,AI Hackathon,Awarded for community contribution'
        const blob = new Blob([headers + sampleData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'technexus_bulk_template.csv'
        a.click()
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            const lines = text.split('\n')
            const data: BulkRequest[] = []

            // Skip header (first line)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim()
                if (!line) continue

                const [email, badge_name, event_name, description] = line.split(',').map(s => s?.trim())

                if (email && badge_name && event_name) {
                    data.push({
                        email,
                        badge_name,
                        event_name,
                        description: description || '',
                        status: 'pending'
                    })
                }
            }

            if (data.length === 0) {
                toast.error('No valid data found in CSV')
            } else {
                setBulkData(data)
                toast.success(`Loaded ${data.length} records!`)
            }
        }
        reader.readAsText(file)
    }

    const processBulk = async () => {
        if (bulkData.length === 0) return
        setLoading(true)
        setProgress(0)

        for (let i = 0; i < bulkData.length; i++) {
            const request = bulkData[i]

            // Update status to processing
            setBulkData(prev => {
                const newData = [...prev]
                newData[i].status = 'processing'
                return newData
            })

            try {
                // 1. Create badge in DB
                const badgeRes = await fetch('/api/badges', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_email: request.email,
                        badge_name: request.badge_name,
                        event_name: request.event_name,
                        badge_description: request.description
                    })
                })

                const badgeResult = await badgeRes.json()
                if (!badgeRes.ok) throw new Error(badgeResult.message || badgeResult.error)

                // 2. Send email via Brevo
                const emailRes = await fetch('/api/send-badge-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to_email: request.email,
                        badge_name: request.badge_name,
                        event_name: request.event_name,
                    })
                })

                if (!emailRes.ok) {
                    const emailResult = await emailRes.json()
                    throw new Error(`Badge created but email failed: ${emailResult.message || 'Error'}`)
                }

                // Update status to success
                setBulkData(prev => {
                    const newData = [...prev]
                    newData[i].status = 'success'
                    return newData
                })

            } catch (err: any) {
                console.error(`Request ${i} failed:`, err)
                setBulkData(prev => {
                    const newData = [...prev]
                    newData[i].status = 'error'
                    newData[i].message = err.message
                    return newData
                })
            }

            // Update overall progress
            setProgress(Math.round(((i + 1) / bulkData.length) * 100))
        }

        setLoading(false)
        toast.success('Bulk processing complete!')
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

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <Link href="/admin" className="inline-flex items-center justify-center p-2 bg-white rounded-xl mb-4 shadow-md">
                        <img src="/logo.png" alt="TechNexus Logo" className="w-16 h-16 object-contain" />
                    </Link>
                    <h1 className="text-3xl font-bold text-navy-900">Bulk Issue Badges</h1>
                    <p className="text-gray-600 mt-2">Upload a CSV file to issue multiple badges at once</p>
                </div>

                {/* Setup Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="card p-6 bg-white flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                            <Download className="w-6 h-6 text-primary-600" />
                        </div>
                        <h3 className="font-bold text-navy-900 mb-2">1. Get the Template</h3>
                        <p className="text-sm text-gray-500 mb-4">Download our CSV structure so your data matches our system.</p>
                        <button onClick={downloadTemplate} className="btn-secondary py-2 px-4 flex items-center space-x-2">
                            <FileJson className="w-4 h-4" />
                            <span>Download CSV Template</span>
                        </button>
                    </div>

                    <div className="card p-6 bg-white flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-navy-900 mb-2">2. Upload your CSV</h3>
                        <p className="text-sm text-gray-500 mb-4">Select your completed file to preview the data before sending.</p>
                        <div className="relative">
                            <button className="btn-primary py-2 px-6 flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Upload File</span>
                            </button>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Preview & Action */}
                {bulkData.length > 0 && (
                    <div className="card bg-white shadow-xl overflow-hidden border-none">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-navy-900">Ready to Process</h3>
                                <p className="text-sm text-gray-500">{bulkData.length} records detected</p>
                            </div>
                            <button
                                onClick={processBulk}
                                disabled={loading}
                                className="btn-primary px-8 py-3 flex items-center space-x-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing {progress}%</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Issue {bulkData.length} Badges Now</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Progress Bar */}
                        {loading && (
                            <div className="h-2 w-full bg-gray-100">
                                <div
                                    className="h-full bg-primary-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}

                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-wider sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">Recipient Email</th>
                                        <th className="px-6 py-3">Badge Details</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {bulkData.map((row, idx) => (
                                        <tr key={idx} className="text-sm">
                                            <td className="px-6 py-4 font-medium text-navy-800">{row.email}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="font-bold text-navy-900">{row.badge_name}</div>
                                                <div className="text-xs">{row.event_name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {row.status === 'pending' && <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">Waiting</span>}
                                                {row.status === 'processing' && <span className="text-primary-600 animate-pulse flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Working...</span>}
                                                {row.status === 'success' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Success</span>}
                                                {row.status === 'error' && (
                                                    <div className="flex flex-col">
                                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center w-fit"><AlertCircle className="w-3 h-3 mr-1" /> Error</span>
                                                        <span className="text-[10px] text-red-500 mt-1 max-w-[200px] truncate">{row.message}</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/admin')}
                        className="text-gray-500 hover:text-primary-600 font-medium transition-all duration-200"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}
