'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser, signOut, isAdmin } from '@/lib/auth'
import { supabase, type Badge } from '@/lib/supabase'
import { Award, LogOut, Calendar, FileText, Loader2, ShieldCheck, User, Settings, X, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Profile Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        designation: ''
    })
    const [isSavingProfile, setIsSavingProfile] = useState(false)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        try {
            const currentUser = await getCurrentUser()
            if (!currentUser) {
                router.push('/auth/signin')
                return
            }

            // Get profile data
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single()

            setUser({ ...currentUser, ...profile })
            setProfileForm({
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || '',
                designation: profile?.designation || ''
            })
            await fetchBadges(currentUser.id)
        } catch (err) {
            router.push('/auth/signin')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSavingProfile(true)
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    first_name: profileForm.first_name,
                    last_name: profileForm.last_name,
                    designation: profileForm.designation,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setUser((prev: any) => ({
                ...prev,
                ...profileForm
            }))

            toast.success('Profile updated successfully!')
            setIsProfileModalOpen(false)
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile')
        } finally {
            setIsSavingProfile(false)
        }
    }

    const fetchBadges = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('badges')
                .select('*')
                .eq('user_id', userId)
                .order('issued_date', { ascending: false })

            if (error) throw error
            setBadges(data || [])
        } catch (err: any) {
            setError('Failed to load badges')
            console.error(err)
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            router.push('/')
        } catch (err) {
            console.error('Sign out error:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your badges...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/" className="flex items-center space-x-3 group">
                                <div className="bg-white p-1 rounded-lg">
                                    <img src="/logo.png" alt="TechNexus Logo" className="w-10 h-10 object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-navy-800 group-hover:text-primary-600 transition-colors">TechNexus Community</h1>
                                    <p className="text-sm text-gray-600">
                                        {user?.first_name
                                            ? `${user.first_name} ${user.last_name} | ${user.designation}`
                                            : user?.email}
                                    </p>
                                </div>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {user && (
                                <button
                                    onClick={() => setIsProfileModalOpen(true)}
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-primary-100"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-2 border-primary-200">
                                        <User className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <span className="hidden sm:inline">Profile</span>
                                </button>
                            )}
                            {user && isAdmin(user.email) && (
                                <Link
                                    href="/admin"
                                    className="flex items-center space-x-2 px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors text-sm font-semibold border border-primary-200"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="hidden sm:inline">Admin Portal</span>
                                    <span className="sm:hidden">Admin</span>
                                </Link>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Profile Edit Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-primary-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Settings className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Edit Profile</h3>
                            </div>
                            <button
                                onClick={() => setIsProfileModalOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={profileForm.first_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={profileForm.last_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={profileForm.designation}
                                    onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                                    placeholder="e.g. Software Engineer"
                                />
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="flex-1 btn-primary py-2 flex items-center justify-center space-x-2 text-sm"
                                >
                                    {isSavingProfile ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Badges</p>
                                <p className="text-3xl font-bold text-navy-900 mt-1">{badges.length}</p>
                            </div>
                            <div className="bg-primary-100 p-3 rounded-lg">
                                <Award className="w-8 h-8 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Latest Badge</p>
                                <p className="text-lg font-bold text-navy-900 mt-1">
                                    {badges.length > 0
                                        ? new Date(badges[0].issued_date).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                            <div className="bg-primary-100 p-3 rounded-lg">
                                <Calendar className="w-8 h-8 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Account Status</p>
                                <p className="text-lg font-bold text-green-600 mt-1">Active</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <FileText className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-6">Your Badges</h2>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {badges.length === 0 ? (
                        <div className="card p-12 text-center">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Badges Yet</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                You haven&apos;t earned any badges yet. Complete events and tasks to receive your first badge via email!
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {badges.map((badge) => (
                                <div key={badge.id} className="badge-card">
                                    <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                        {badge.badge_image_url ? (
                                            <Image
                                                src={badge.badge_image_url}
                                                alt={badge.badge_name}
                                                width={200}
                                                height={200}
                                                className="object-contain"
                                            />
                                        ) : (
                                            <Award className="w-24 h-24 text-primary-400" />
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-navy-900 mb-2">
                                        {badge.badge_name}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-3">
                                        {badge.badge_description}
                                    </p>

                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Event:</span>
                                            <span className="font-semibold text-navy-800">{badge.event_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-2">
                                            <span className="text-gray-500">Issued:</span>
                                            <span className="font-semibold text-navy-800">
                                                {new Date(badge.issued_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
