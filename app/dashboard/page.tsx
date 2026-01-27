'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser, signOut, isAdmin } from '@/lib/auth'
import { supabase, type Badge } from '@/lib/supabase'
import { Award, LogOut, Calendar, FileText, Loader2, ShieldCheck, User, Settings, X, Save, Linkedin, Share2, Download } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const handleDownload = async (imageUrl: string, badgeName: string) => {
        console.log('Download requested for:', imageUrl)
        try {
            if (!imageUrl) {
                toast.error('No image available for download')
                return
            }

            // Optimization: If it's a Supabase public URL, we can force download via query param
            let downloadUrl = imageUrl
            if (imageUrl.includes('supabase.co/storage/v1/object/public')) {
                const separator = imageUrl.includes('?') ? '&' : '?'
                downloadUrl = `${imageUrl}${separator}download=${encodeURIComponent(badgeName.replace(/\s+/g, '_'))}.png`

                console.log('Detected Supabase URL, using force-download:', downloadUrl)
                // For Supabase download links, simple window.location or <a> tag works best
                const link = document.createElement('a')
                link.href = downloadUrl
                link.target = '_self'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.success('Download started!')
                return
            }

            // Standard CORS fetch for other images
            console.log('Attempting CORS fetch for external image...')
            const response = await fetch(imageUrl, { mode: 'cors' })
            if (!response.ok) throw new Error('Network response was not ok')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${badgeName.replace(/\s+/g, '_')}_Badge.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Download started!')
        } catch (err) {
            console.error('Download execution failed:', err)
            // Final Fallback: Just open the image
            window.open(imageUrl, '_blank')
            toast.success('Opening image in new tab. You can right-click and Save As.')
        }
    }

    const shareToLinkedIn = (badge: Badge) => {
        console.log('LinkedIn share triggered for badge:', badge.badge_name)
        // Use the deployed app URL for sharing, fallback to window.location.origin
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        const badgeUrl = `${appUrl}/dashboard/badge/${badge.id}`
        const text = `I'm proud to share that I've earned the "${badge.badge_name}" digital badge from the TechNexus Community! 🚀\n\nView my verified credential here: ${badgeUrl}`

        // Use the sharing endpoint which is more reliable for previews
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(badgeUrl)}`

        const popup = window.open(shareUrl, '_blank', 'width=600,height=600')
        if (!popup) {
            toast.error('Pop-up blocked! Please allow pop-ups to share on LinkedIn.')
        } else {
            toast.success('Opening LinkedIn Share dialog...')
        }
    }

    // Profile Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        designation: ''
    })
    const [isSavingProfile, setIsSavingProfile] = useState(false)

    useEffect(() => {
        const initialize = async () => {
            // Give a small delay for Supabase to recover session from storage on mobile
            await new Promise(r => setTimeout(r, 500))
            await checkUser()
        }
        initialize()
    }, [])

    const checkUser = async () => {
        try {
            const currentUser = await getCurrentUser()
            if (!currentUser) {
                router.replace('/auth/signin?next=/dashboard')
                return
            }

            // Get profile data
            let { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single()

            // FALLBACK: If profile doesn't exist (trigger failed), create it now
            if (!profile || profileError) {
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: currentUser.id,
                        first_name: currentUser.user_metadata?.first_name || '',
                        last_name: currentUser.user_metadata?.last_name || '',
                        designation: currentUser.user_metadata?.designation || '',
                        email: currentUser.email,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single()

                if (!createError) {
                    profile = newProfile
                }
            }

            setUser({ ...currentUser, ...profile })
            setProfileForm({
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || '',
                designation: profile?.designation || ''
            })
            await fetchBadges(currentUser.id)
        } catch (err) {
            console.error('Check user error:', err)
            router.replace('/auth/signin')
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
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                            <Link href="/" className="flex items-center space-x-2 group min-w-0">
                                <div className="bg-white p-1 rounded-lg flex-shrink-0">
                                    <img src="/logo.png" alt="TechNexus Logo" className="h-10 sm:h-14 w-auto object-contain" />
                                </div>
                                <div className="min-w-0 flex items-center">
                                    <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px] xs:max-w-[200px] sm:max-w-[300px] ml-2 font-bold">
                                        {user?.first_name
                                            ? `${user.first_name} ${user.last_name}`
                                            : user?.email}
                                    </p>
                                </div>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-4">
                            {user && (
                                <>
                                    <button
                                        onClick={() => setIsProfileModalOpen(true)}
                                        className="p-3 sm:p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent select-none active:scale-95"
                                        title="Profile"
                                    >
                                        <User className="w-5 h-5" />
                                    </button>

                                    {isAdmin(user.email) && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center space-x-1 px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors text-xs sm:text-sm font-semibold border border-primary-200 select-none active:scale-95"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="hidden sm:inline">Admin Portal</span>
                                            <span className="sm:hidden">Admin</span>
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleSignOut}
                                        className="p-3 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors select-none active:scale-95"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <Toaster position="top-right" />

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
                                <div key={badge.id} className="badge-card p-5">
                                    <Link href={`/dashboard/badge/${badge.id}`} className="block group">
                                        <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity relative">
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

                                        <h3 className="text-lg font-bold text-navy-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                                            {badge.badge_name}
                                        </h3>

                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                                            {badge.badge_description}
                                        </p>
                                    </Link>

                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Event:</span>
                                            <span className="font-semibold text-navy-800 truncate ml-2">{badge.event_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-2">
                                            <span className="text-gray-500">Credential ID:</span>
                                            <span className="font-mono text-[10px] text-primary-600 uppercase font-bold">
                                                {badge.credential_id || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <button
                                            onClick={() => handleDownload(badge.badge_image_url || '', badge.badge_name)}
                                            className="flex items-center justify-center space-x-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-sm active:scale-95"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download</span>
                                        </button>
                                        <button
                                            onClick={() => shareToLinkedIn(badge)}
                                            className="flex items-center justify-center space-x-2 py-2.5 bg-[#0077B5] text-white rounded-xl hover:bg-[#005c8d] transition-all font-semibold text-sm shadow-md hover:shadow-lg active:scale-95"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                            <span>Share</span>
                                        </button>
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
