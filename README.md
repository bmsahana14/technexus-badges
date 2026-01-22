# 🏆 TechNexus Community - Digital Credentials Portal

A secure, professional digital badge management portal built with Next.js for the TechNexus Community.

![Next.js](https://img.shields.io/badge/Next.js-14.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?style=flat-square&logo=tailwindcss)

## 🎯 Overview

TechNexus Community is a state-of-the-art web application designed for issuing, managing, and showcasing digital achievements. Community members can securely access their earned badges, while administrators have a powerful console to issue and track credentials.

### ✨ Key Features

- 🔐 **Role-Based Admin Portal** - Powerful management console exclusively for authorized administrators.
- 🎨 **Custom Branding** - Fully integrated TechNexus Community visual identity and logo.
- 🏅 **Badge Management** - Members can view and showcase their secure digital credentials.
- 📤 **Admin Console** - Issue new badges with custom image uploads to Supabase Storage.
- 📦 **Bulk Issuance** - Issue badges to hundreds of students at once via CSV upload with real-time tracking.
- 📥 **Automated Outreach** - High-volume email notifications via Brevo (300/day free) for every badge.
- 📱 **Modern & Responsive** - A premium, mobile-optimized experience across all devices.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- A Brevo account ([brevo.com](https://brevo.com))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd badges
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
Create a `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Setup (Whitelisted emails)
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,your-email@example.com

# Email (Brevo) & App
BREVO_API_KEY=your_brevo_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

4. **Initialize Database**
- Run `supabase-schema.sql` in your Supabase SQL Editor.
- Create a storage bucket named `badge-images` and set it to **Public**.

5. **Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3002](http://localhost:3002)

## 📁 Project Structure

```
badges/
├── app/
│   ├── admin/               # Admin Management Console
│   │   ├── issue/           # Badge Issuance Form
│   │   └── page.tsx         # Admin Dashboard
│   ├── api/                 # Backend API Routes (Upload, Badges, Email)
│   ├── auth/                # Sign In & Sign Up Pages
│   ├── dashboard/           # Member Personal Dashboard
│   └── page.tsx             # TechNexus Community Landing Page
├── lib/                     # Auth & Supabase Utilities
├── public/                  # TechNexus Logos & Static Assets
└── supabase-schema.sql      # Database Setup
```

## 🔐 Admin Console Features

- **Stats Dashboard**: Real-time view of total badges, unique recipients, and daily activity.
- **Badge Management**: Search, filter, and view every badge issued on the platform.
- **Secure Issuance**: Drag-and-drop custom design upload with instant email delivery.
- **Revocation**: Ability for admins to revoke/delete badges directly from the console.

## 🚀 Deployment

The platform is designed for seamless deployment on **Vercel**. Ensure all environment variables are added to your Vercel project settings, especially the `NEXT_PUBLIC_ADMIN_EMAILS` to secure your portal.

## 🔒 Security

- ✅ **Server-Side Uploads**: Bypasses client-side RLS restrictions for secure image management.
- ✅ **Whitelisted Admins**: Only specific emails can access the `/admin` portal.
- ✅ **Service Role Integration**: Secure backend operations for badge revocation and data management.

---

**Built with ❤️ for the TechNexus Community**
