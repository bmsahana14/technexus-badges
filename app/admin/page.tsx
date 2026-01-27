'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, signOut, isAdmin } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import {
    Award,
    Users,
    BarChart3,
    LogOut,
    LayoutDashboard,
    Loader2,
    ArrowRight,
    Search,
    Trash2,
    ExternalLink,
    RefreshCcw,
    Mail,
    FileJson,
    ChevronLeft,
    ChevronRight,
    Trash,
    Eye,
    EyeOff
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [stats, setStats] = useState({
        totalBadges: 0,
        totalUsers: 0,
        recentIssuance: 0
    })
    const [badges, setBadges] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Archiving (Hiding) State
    const [showArchived, setShowArchived] = useState(false)
    const [hiddenIds, setHiddenIds] = useState<string[]>([])

    useEffect(() => {
        const initialize = async () => {
            await checkAuth()
            // Load hidden badges from localStorage
            const savedHidden = localStorage.getItem('technexus_hidden_badges')
            if (savedHidden) {
                try {
                    setHiddenIds(JSON.parse(savedHidden))
                } catch (e) {
                    console.error('Error loading hidden badges:', e)
                }
            }
        }
        initialize()
    }, [])

    const toggleHideBadge = (id: string, name: string) => {
        const isCurrentlyHidden = hiddenIds.includes(id)
        let newHidden: string[]

        if (isCurrentlyHidden) {
            newHidden = hiddenIds.filter(hideId => hideId !== id)
            toast.success(`"${name}" is now visible in your main list.`)
        } else {
            newHidden = [...hiddenIds, id]
            toast.success(`"${name}" archived (hidden from this view).`)
        }

        setHiddenIds(newHidden)
        localStorage.setItem('technexus_hidden_badges', JSON.stringify(newHidden))
    }

    const checkAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user

            if (!user) {
                router.push('/auth/signin?next=/admin')
                return
            }

            if (!isAdmin(user.email)) {
                toast.error('Access denied. Administrator privileges required.')
                router.push('/dashboard')
                return
            }

            await Promise.all([
                getCurrentUser().then(secureUser => {
                    if (!secureUser || !isAdmin(secureUser.email)) {
                        router.push('/dashboard')
                        throw new Error('Unauthorized')
                    }
                }),
                loadData()
            ])

            setLoading(false)
        } catch (error) {
            console.error('Admin Auth Check - EXCEPTION:', error)
            if (error instanceof Error && error.message !== 'Unauthorized') {
                router.push('/auth/signin')
            }
        }
    }

    const loadData = async () => {
        setRefreshing(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                toast.error('Session expired. Please sign in.')
                router.push('/auth/signin')
                return
            }

            const res = await fetch('/api/admin/data', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to fetch admin data')
            }

            const { badges: allBadges } = await res.json()
            setBadges(allBadges || [])

            const uniqueUserCount = new Set(allBadges?.map((u: any) => u.user_id)).size

            setStats({
                totalBadges: allBadges?.length || 0,
                totalUsers: uniqueUserCount || 0,
                recentIssuance: allBadges?.filter((b: any) => {
                    const today = new Date()
                    const badgeDate = new Date(b.created_at)
                    return badgeDate.toDateString() === today.toDateString()
                }).length || 0
            })
        } catch (error: any) {
            console.error('Error fetching data:', error)
            toast.error(error.message || 'Failed to load dashboard data')
        } finally {
            setRefreshing(false)
        }
    }

    const handleDeleteBadge = async (id: string, name: string) => {
        const warning = `🚨 PERMANENT ACTION ALERT:\n\nRevoking this credential will:\n1. Remove it from the user's dashboard immediately.\n2. Permanently disable the public verification link.\n3. Delete the record from the database.\n\nOnly do this for errors or fraud. Do NOT revoke badges for completed events.\n\nAre you absolutely sure you want to revoke "${name}"?`

        if (!confirm(warning)) return

        const loadingToast = toast.loading(`Revoking "${name}"...`)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('No active session')

            const res = await fetch('/api/badges/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ id })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to delete badge')
            }

            toast.success('Badge revoked successfully', { id: loadingToast })
            loadData()
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast })
        }
    }

    const filteredBadges = badges.filter((badge: any) => {
        const matchesSearch =
            badge.badge_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (badge.credential_id && badge.credential_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            badge.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase())

        if (!matchesSearch) return false

        const isArchived = hiddenIds.includes(badge.id)
        if (showArchived) return true
        return !isArchived
    })

    const totalPages = Math.ceil(filteredBadges.length / itemsPerPage)
    const paginatedBadges = filteredBadges.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, showArchived])

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster position="top-right" />

            {/* Admin Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <Link href="/" className="flex items-center space-x-3 group min-w-0">
                            <div className="flex-shrink-0">
                                <img src="/logo.png" alt="TechNexus Logo" className="h-10 sm:h-14 w-auto object-contain" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest bg-navy-900 px-2 py-1 rounded text-white ml-2">Admin Portal</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            onClick={loadData}
                            className={`p-3 sm:p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 active:scale-95 active:bg-primary-100 transition-all select-none ${refreshing ? 'animate-spin text-primary-600' : ''}`}
                            title="Refresh"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <Link
                            href="/dashboard"
                            className="p-3 sm:p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 active:scale-95 active:bg-primary-100 transition-all select-none"
                            title="User View"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="p-3 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 active:scale-95 active:bg-red-100 rounded-lg transition-all select-none"
                            title="Exit"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-navy-900">Dashboard Overview</h2>
                        <p className="text-gray-500 mt-1">Control center for all issued credentials</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/admin/bulk"
                            className="btn-primary flex items-center justify-center space-x-2 py-3 px-8 shadow-xl hover:shadow-primary-100"
                        >
                            <Mail className="w-5 h-5" />
                            <span className="text-lg font-bold">Bulk Issue Badges</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="card p-8 bg-white border-none shadow-sm h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Badges</p>
                                <p className="text-4xl font-black text-navy-900">{stats.totalBadges}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl">
                                <Award className="w-8 h-8 text-primary-500" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-8 bg-white border-none shadow-sm h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Recipients</p>
                                <p className="text-4xl font-black text-navy-900">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-2xl">
                                <Users className="w-8 h-8 text-indigo-500" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-8 bg-white border-none shadow-sm h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Issued Today</p>
                                <p className="text-4xl font-black text-navy-900">{stats.recentIssuance}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl">
                                <BarChart3 className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge Management Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-navy-900 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
                            Registry
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                                <Search className="w-4 h-4 mr-2" />
                                Filter:
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name, ID, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-4 pr-10 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none w-full md:w-64 font-medium"
                                />
                            </div>
                            <div className="h-8 w-px bg-gray-100 hidden md:block"></div>
                            <button
                                onClick={() => setShowArchived(!showArchived)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${showArchived ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                {showArchived ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                <span>{showArchived ? 'Showing All' : 'Hide Archived'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 bg-gray-50">Badge & ID</th>
                                    <th className="px-6 py-4 bg-gray-50">Recipient</th>
                                    <th className="px-6 py-4 bg-gray-50">Event</th>
                                    <th className="px-6 py-4 bg-gray-50">Date</th>
                                    <th className="px-6 py-4 bg-gray-50 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedBadges.map((badge: any) => (
                                    <tr key={badge.id} className={`hover:bg-gray-50 transition-colors ${hiddenIds.includes(badge.id) ? 'opacity-60 bg-gray-50/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                                                    {badge.badge_image_url ? (
                                                        <img src={badge.badge_image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Award className="w-5 h-5 text-primary-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-navy-900 truncate">{badge.badge_name}</p>
                                                    <p className="font-mono text-[9px] text-primary-600 font-bold uppercase">{badge.credential_id || 'NO-ID'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {badge.profiles ? (
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-navy-800 truncate">
                                                        {badge.profiles.first_name} {badge.profiles.last_name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 truncate">{badge.profiles.email}</p>
                                                </div>
                                            ) : (
                                                <div className="min-w-0">
                                                    <p className="text-xs text-primary-600 font-medium truncate">{badge.recipient_email}</p>
                                                    <p className="text-[9px] bg-primary-50 text-primary-600 w-fit px-1.5 py-0.5 rounded mt-0.5">Unclaimed</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                                                {badge.event_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                            {new Date(badge.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => toggleHideBadge(badge.id, badge.badge_name)}
                                                    className={`p-3 sm:p-2 rounded-lg transition-all active:scale-90 select-none ${hiddenIds.includes(badge.id) ? 'text-primary-600 bg-primary-50' : 'text-gray-300 hover:text-primary-600 hover:bg-primary-50'}`}
                                                    title={hiddenIds.includes(badge.id) ? "Unarchive" : "Archive (Hide from this view)"}
                                                >
                                                    {hiddenIds.includes(badge.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBadge(badge.id, badge.badge_name)}
                                                    className="p-3 sm:p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 active:scale-90 rounded-lg transition-all disabled:opacity-50 select-none"
                                                    title="Revoke Credential (Permanent removal)"
                                                    disabled={refreshing}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={badge.badge_image_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 sm:p-2 text-gray-300 hover:text-primary-600 hover:bg-primary-50 active:scale-90 rounded-lg transition-all select-none"
                                                    title="View"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {paginatedBadges.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                            <p className="text-gray-400 font-medium text-sm">No matching records found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-bold text-navy-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-navy-900">{Math.min(currentPage * itemsPerPage, filteredBadges.length)}</span> of <span className="font-bold text-navy-900">{filteredBadges.length}</span> results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 sm:p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all select-none active:scale-90"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center space-x-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 sm:w-8 sm:h-8 rounded-lg text-sm font-bold transition-all select-none active:scale-90 ${currentPage === i + 1
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-3 sm:p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all select-none active:scale-90"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Management Helpers */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-6 bg-white border-none shadow-sm flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-xl">
                            <Mail className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-navy-900">Email System Active</h4>
                            <p className="text-sm text-gray-500 mt-1">Automatic notifications are sent via Brevo for every new badge issued.</p>
                        </div>
                    </div>
                    <div className="card p-6 bg-white border-none shadow-sm flex items-start space-x-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                            <FileJson className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-navy-900">Bulk Issue Enabled</h4>
                            <p className="text-sm text-gray-500 mt-1">CSV upload support is active. You can issue hundreds of badges at once using the Bulk Issue tool.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
