import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'TechNexus Community - Secure Digital Badge Management',
    description: 'A professional platform for managing and viewing your digital badges for the TechNexus Community',
    keywords: ['badges', 'digital badges', 'credentials', 'achievements', 'technexus'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
