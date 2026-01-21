# ⚡ TechNexus Community - Quick Start Guide

Get your TechNexus Community portal running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Resend account (for emails)

## Step 1: Install Dependencies (1 minute)

```bash
cd c:\Users\lenovo\Desktop\badges
npm install
```

## Step 2: Set Up Supabase (2 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a "New Project"

### Run Database Schema
1. Go to **SQL Editor** in Supabase
2. Copy content from `supabase-schema.sql` and click **Run**

### Create Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. Create bucket named: `badge-images`
3. Set to **Public** (important for image display)

### Get API Keys
1. Go to **Project Settings → API**
2. Copy `URL`, `anon public key`, and `service_role key`

## Step 3: Set Up Resend (1 minute)

1. Go to [resend.com](https://resend.com)
2. Create an API Key

## Step 4: Configure Environment (1 minute)

Create `.env.local` file with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Setup (Whitelisted emails)
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com

# Email & App URL
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

## Step 5: Run the App!

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

## Step 6: Test the TechNexus Portal

### 🔐 1. Access Admin Console
- Sign up with the email you added to `NEXT_PUBLIC_ADMIN_EMAILS`
- Navigate to the **Admin Portal** link in the footer or go to `/admin`
- Success! You now see the Admin Console.

### 🏅 2. Issue Your First Badge
- Click **"Issue New Badge"**
- Enter a recipient email (tip: use another email you own)
- Upload a custom image or use a URL
- Submit!

### 📥 3. View as Member
- Check your recipient email for the TechNexus invite.
- Link take you to `/dashboard` where your new badge is waiting!

---

**Built with ❤️ for the TechNexus Community**
