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
    credential_id?: string
    status: 'pending' | 'processing' | 'success' | 'error'
    message?: string
}

export default function BulkIssuePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [bulkData, setBulkData] = useState<BulkRequest[]>([])
    const [progress, setProgress] = useState(0)

    // Image state for bulk
    const [bulkImageFile, setBulkImageFile] = useState<File | null>(null)
    const [bulkImagePreview, setBulkImagePreview] = useState<string | null>(null)
    const [bulkImageUrl, setBulkImageUrl] = useState('')

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
        const headers = 'email,badge_name,event_name,description,credential_id\n'
        const sampleData = 'user1@example.com,Technical Mentor,Web Workshop 2026,Awarded for exceptional mentorship,TN-WEB-2026-001\nuser2@example.com,Top Contributor,AI Hackathon,Awarded for community contribution,TN-AI-2026-999'
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

                // Robust CSV split using regex to handle quoted commas
                // Matches either: "field with, comma" OR non-comma sequence
                const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                const columns = match ? match.map(s => s.replace(/^"|"$/g, '').trim()) : [];

                const [email, badge_name, event_name, description, credential_id] = columns

                if (email && badge_name && event_name) {
                    data.push({
                        email,
                        badge_name,
                        event_name,
                        description: description || '',
                        credential_id: credential_id || '',
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setBulkImageFile(file)
            setBulkImagePreview(URL.createObjectURL(file))
        }
    }

    const clearImage = () => {
        setBulkImageFile(null)
        setBulkImagePreview(null)
    }

    const processBulk = async () => {
        if (bulkData.length === 0) return

        // IMAGE VALIDATION ALERT
        if (!bulkImageFile && !bulkImageUrl) {
            alert('CRITICAL ERROR: No badge image provided! Please upload a badge image file or provide a URL before issuing badges.')
            toast.error('Badge image is required.')
            return
        }

        setLoading(true)
        setProgress(0)

        try {
            let finalImageUrl = bulkImageUrl

            // 1. Upload common image once if provided
            if (bulkImageFile) {
                const fileExt = bulkImageFile.name.split('.').pop()
                const fileName = `bulk-${Date.now()}.${fileExt}`

                const formData = new FormData()
                formData.append('file', bulkImageFile)
                formData.append('fileName', fileName)

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!uploadRes.ok) throw new Error('Failed to upload bulk image')
                const { publicUrl } = await uploadRes.json()
                finalImageUrl = publicUrl
            }

            // 2. Process recipients in chunks (batch size 20 for maximum speed)
            const CHUNK_SIZE = 20
            for (let i = 0; i < bulkData.length; i += CHUNK_SIZE) {
                const chunk = bulkData.slice(i, i + CHUNK_SIZE)

                await Promise.all(chunk.map(async (request, index) => {
                    const actualIdx = i + index

                    try {
                        const badgeRes = await fetch('/api/badges', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_email: request.email,
                                badge_name: request.badge_name,
                                event_name: request.event_name,
                                badge_description: request.description,
                                badge_image_url: finalImageUrl,
                                credential_id: request.credential_id
                            })
                        })

                        const badgeResult = await badgeRes.json()
                        if (!badgeRes.ok) throw new Error(badgeResult.message || badgeResult.error)

                        await fetch('/api/send-badge-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to_email: request.email,
                                badge_name: request.badge_name,
                                event_name: request.event_name,
                                is_new_user: badgeResult.requires_registration,
                                badge_id: badgeResult.badge.id
                            })
                        })

                        setBulkData(prev => {
                            const newData = [...prev]
                            newData[actualIdx].status = 'success'
                            if (badgeResult.requires_registration) {
                                newData[actualIdx].message = 'Pending Registration'
                            }
                            return newData
                        })

                    } catch (err: any) {
                        setBulkData(prev => {
                            const newData = [...prev]
                            newData[actualIdx].status = 'error'
                            newData[actualIdx].message = err.message
                            return newData
                        })
                    }
                }))

                setProgress(Math.round((Math.min(i + CHUNK_SIZE, bulkData.length) / bulkData.length) * 100))
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
            toast.success('Bulk processing complete!')
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

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <Link href="/admin" className="inline-flex items-center justify-center p-2 bg-white rounded-xl mb-4 shadow-md">
                        <img src="/logo.png" alt="TechNexus Logo" className="w-16 h-16 object-contain" />
                    </Link>
                    <h1 className="text-3xl font-bold text-navy-900">Bulk Issue Badges</h1>
                    <p className="text-gray-600 mt-2">Upload a CSV file to issue multiple badges at once</p>
                </div>

                {/* Setup Section */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6 bg-white flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                            <Download className="w-6 h-6 text-primary-600" />
                        </div>
                        <h3 className="font-bold text-navy-900 mb-2">1. Get Template</h3>
                        <p className="text-xs text-gray-500 mb-4">Download CSV structure.</p>
                        <button onClick={downloadTemplate} className="btn-secondary py-2 px-4 flex items-center space-x-2 text-xs">
                            <FileJson className="w-4 h-4" />
                            <span>Template</span>
                        </button>
                    </div>

                    <div className="card p-6 bg-white flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-navy-900 mb-2">2. Upload CSV</h3>
                        <p className="text-xs text-gray-500 mb-4">Select your completed file.</p>
                        <div className="relative">
                            <button className="btn-primary py-2 px-4 flex items-center space-x-2 text-xs">
                                <Upload className="w-4 h-4" />
                                <span>Upload</span>
                            </button>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="card p-6 bg-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <Award className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-navy-900 mb-2">3. Badge Image</h3>
                        <p className="text-xs text-gray-500 mb-4">(Optional) Set for all.</p>

                        {bulkImagePreview ? (
                            <div className="relative w-full h-10 flex items-center justify-center bg-gray-50 rounded-lg mb-2">
                                <img src={bulkImagePreview} alt="Preview" className="h-full object-contain" />
                                <button onClick={clearImage} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full shadow-sm">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative mb-2">
                                <button className="btn-secondary py-2 px-4 flex items-center space-x-2 text-xs">
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Image</span>
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        )}

                        <div className="w-full mt-2">
                            <input
                                type="url"
                                placeholder="Or paste image URL..."
                                className="w-full text-[10px] p-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-primary-200"
                                value={bulkImageUrl}
                                onChange={(e) => setBulkImageUrl(e.target.value)}
                                disabled={!!bulkImageFile}
                            />
                        </div>
                    </div>
                </div>

                {/* Data Preview & Action */}
                {bulkData.length > 0 ? (
                    <div className="card bg-white shadow-xl overflow-hidden border-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-navy-900 text-xl">Ready to Process</h3>
                                <p className="text-sm text-gray-500">{bulkData.length} records detected and ready for issuance</p>
                            </div>
                            <div className="flex items-center space-x-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setBulkData([])}
                                    disabled={loading}
                                    className="px-4 py-3 text-gray-400 hover:text-red-600 transition-colors text-sm font-semibold"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={processBulk}
                                    disabled={loading}
                                    className="btn-primary px-10 py-4 flex items-center justify-center space-x-3 disabled:opacity-50 shadow-lg shadow-primary-200 flex-1 sm:flex-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="text-lg">Processing {progress}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-6 h-6" />
                                            <span className="text-lg font-bold">Issue {bulkData.length} Badges Now</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {loading && (
                            <div className="bg-primary-50 px-6 py-2 border-b border-primary-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-ping"></span>
                                    <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest leading-none">Running High-Speed Batch (x20)</span>
                                </div>
                                <span className="text-[10px] font-bold text-primary-600">{progress}% Complete</span>
                            </div>
                        )}

                        {/* Progress Bar */}
                        {loading && (
                            <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 transition-all duration-500 ease-out"
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
                                                {row.status === 'success' && (
                                                    <div className="flex flex-col">
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Success</span>
                                                        {row.message && <span className="text-[10px] text-primary-600 mt-1">{row.message}</span>}
                                                    </div>
                                                )}
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
                ) : (
                    <div className="card bg-white border-2 border-dashed border-gray-200 p-12 text-center animate-in fade-in duration-500">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileJson className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            Once you upload your CSV file in Step 2, you'll see a preview of all recipients and the "Issue Badges" button here.
                        </p>
                        <div className="inline-flex items-center text-primary-600 font-semibold text-sm">
                            <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center mr-2">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            Awaiting CSV Upload...
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
