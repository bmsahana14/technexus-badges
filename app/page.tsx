import Link from 'next/link'
import { Shield, Award, Lock, CheckCircle } from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/" className="flex items-center space-x-3 group">
                                <div className="bg-white p-1 rounded-lg">
                                    <img src="/logo.png" alt="TechNexus Logo" className="w-10 h-10 object-contain" />
                                </div>
                                <h1 className="text-2xl font-bold text-navy-800 group-hover:text-primary-600 transition-colors">TechNexus Community</h1>
                            </Link>
                        </div>
                        <div className="flex space-x-4">
                            <Link href="/auth/signin" className="btn-secondary">
                                Sign In
                            </Link>
                            <Link href="/auth/signup" className="btn-primary">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-primary-100 rounded-full mb-6">
                        <Shield className="w-6 h-6 text-primary-600 mr-2" />
                        <span className="text-primary-700 font-semibold text-sm">Secure & Professional</span>
                    </div>

                    <h2 className="text-5xl font-bold text-navy-900 mb-6 leading-tight">
                        Your Digital Badges,<br />
                        <span className="text-primary-600">Securely Managed</span>
                    </h2>

                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Access and manage your earned digital badges through our secure, professional platform.
                        Simple, trustworthy, and designed for your success.
                    </p>

                    <div className="flex justify-center space-x-4">
                        <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
                            Create Account
                        </Link>
                        <Link href="/auth/signin" className="btn-secondary text-lg px-8 py-4">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card p-8 text-center">
                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-navy-800 mb-3">Secure Access</h3>
                        <p className="text-gray-600">
                            Your badges are protected with enterprise-grade security and encrypted authentication.
                        </p>
                    </div>

                    <div className="card p-8 text-center">
                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-navy-800 mb-3">Easy Management</h3>
                        <p className="text-gray-600">
                            View and access all your earned badges in one centralized, professional dashboard.
                        </p>
                    </div>

                    <div className="card p-8 text-center">
                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-navy-800 mb-3">Instant Access</h3>
                        <p className="text-gray-600">
                            Receive badge links via email and access them instantly through our platform.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white py-20 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-3xl font-bold text-center text-navy-900 mb-12">How It Works</h3>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                1
                            </div>
                            <h4 className="font-bold text-navy-800 mb-2">Complete Event</h4>
                            <p className="text-gray-600 text-sm">Finish your course, workshop, or achievement</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                2
                            </div>
                            <h4 className="font-bold text-navy-800 mb-2">Receive Email</h4>
                            <p className="text-gray-600 text-sm">Get a secure badge link in your inbox</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                3
                            </div>
                            <h4 className="font-bold text-navy-800 mb-2">Sign In</h4>
                            <p className="text-gray-600 text-sm">Access your account securely</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                4
                            </div>
                            <h4 className="font-bold text-navy-800 mb-2">View Badge</h4>
                            <p className="text-gray-600 text-sm">See your earned badges in your dashboard</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-navy-900 text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center space-x-3">
                            <img src="/logo.png" alt="TechNexus Logo" className="w-8 h-8 object-contain bg-white rounded-md p-0.5" />
                            <span className="text-lg font-semibold">TechNexus Community</span>
                        </div>
                        <div className="flex space-x-6 text-sm text-gray-400">
                            <Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link>
                            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
                            <Link href="/admin" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">Admin Portal</Link>
                        </div>
                        <p className="text-gray-500 text-xs mt-4">
                            © 2026 TechNexus Community. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
