# 🏆 Badge Delivery Platform

> **A minimal, production-ready digital badge management platform with professional light blue UI theme**

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

---

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Install dependencies (already done!)
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Resend keys

# 3. Run development server
npm run dev
```

**📖 Full Guide**: See [`QUICKSTART.md`](QUICKSTART.md)

---

## 🎯 What This Platform Does

Users receive **badge links via email** → Click link → **Sign in** → **View badges in dashboard**

### ✨ Key Features

- 🔐 **Secure Authentication** (Supabase Auth)
- 🏅 **Badge Management** (View earned badges)
- 📧 **Email Notifications** (Professional templates)
- 🎨 **Professional UI** (Light blue theme)
- 📱 **Fully Responsive** (Mobile + Desktop)
- ⚡ **Vercel Ready** (One-click deploy)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | Get started in 5 minutes |
| **[README.md](README.md)** | Complete documentation |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Deploy to Vercel guide |
| **[API_DOCS.md](API_DOCS.md)** | API endpoint reference |
| **[ENV_SETUP.md](ENV_SETUP.md)** | Environment variables guide |
| **[CHECKLIST.md](CHECKLIST.md)** | Setup & deployment checklist |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Architecture overview |
| **[COMPLETE.md](COMPLETE.md)** | Project completion summary |

---

## 🏗️ Project Structure

```
badges/
├── app/
│   ├── api/
│   │   ├── badges/              # Badge CRUD API
│   │   └── send-badge-email/    # Email sending API
│   ├── auth/
│   │   ├── signin/              # Sign in page
│   │   └── signup/              # Sign up page
│   ├── dashboard/               # User dashboard
│   └── page.tsx                 # Landing page
├── lib/
│   ├── auth.ts                  # Auth helpers
│   └── supabase.ts              # Supabase client
└── supabase-schema.sql          # Database schema
```

---

## 🎨 Design Preview

### Landing Page
![Landing Page Preview](https://via.placeholder.com/800x500/1890ff/ffffff?text=Professional+Light+Blue+Landing+Page)

### Dashboard
![Dashboard Preview](https://via.placeholder.com/800x500/1890ff/ffffff?text=Badge+Dashboard+with+Stats)

**Color Theme**: Light Blue (`#1890ff`) + Navy (`#1a237e`) + White

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Email**: Resend
- **Deployment**: Vercel

---

## 📋 Setup Checklist

### Before You Start

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Resend account created

### Setup Steps

1. **Supabase Setup** (5 min)
   - [ ] Create project
   - [ ] Run `supabase-schema.sql`
   - [ ] Create `badge-images` bucket (Private)
   - [ ] Copy API keys

2. **Resend Setup** (2 min)
   - [ ] Get API key

3. **Local Setup** (3 min)
   - [ ] Create `.env.local`
   - [ ] Add environment variables
   - [ ] Run `npm run dev`

4. **Test** (5 min)
   - [ ] Sign up
   - [ ] Create badge via API
   - [ ] Send email via API
   - [ ] View badge in dashboard

**📖 Detailed Guide**: See [`CHECKLIST.md`](CHECKLIST.md)

---

## 🔐 Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**📖 Full Guide**: See [`ENV_SETUP.md`](ENV_SETUP.md)

---

## 📧 API Usage

### Create Badge

```bash
curl -X POST http://localhost:3000/api/badges \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "user@example.com",
    "badge_name": "Web Dev Master",
    "event_name": "Bootcamp 2026"
  }'
```

### Send Email

```bash
curl -X POST http://localhost:3000/api/send-badge-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "user@example.com",
    "badge_name": "Web Dev Master",
    "event_name": "Bootcamp 2026"
  }'
```

**📖 Full API Docs**: See [`API_DOCS.md`](API_DOCS.md)

---

## 🚀 Deploy to Vercel

### Quick Deploy

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

**📖 Detailed Guide**: See [`DEPLOYMENT.md`](DEPLOYMENT.md)

---

## ✅ What's Included

- ✅ **Complete Application** (Landing, Auth, Dashboard)
- ✅ **API Routes** (Badges, Email)
- ✅ **Database Schema** (SQL file)
- ✅ **Email Templates** (Professional HTML)
- ✅ **Documentation** (8 comprehensive guides)
- ✅ **Configuration** (All setup files)
- ✅ **Security** (RLS, encryption, best practices)
- ✅ **Responsive Design** (Mobile + Desktop)

---

## 🎯 User Flow

```
Event → Badge Created → Email Sent → User Clicks Link
                                            ↓
                                    Sign Up/Sign In
                                            ↓
                                    View Badge in Dashboard
```

---

## 🔒 Security

- ✅ Supabase Auth with encryption
- ✅ Row Level Security (RLS)
- ✅ Private storage buckets
- ✅ Secure sessions
- ✅ Environment variables
- ✅ HTTPS (Vercel)

---

## 📱 Responsive Design

- ✅ Mobile (< 768px)
- ✅ Tablet (768px - 1024px)
- ✅ Desktop (> 1024px)

---

## 🎨 Customization

Easy to customize:
- **Colors**: `tailwind.config.ts`
- **Email**: `/app/api/send-badge-email/route.ts`
- **Pages**: `/app/**/page.tsx`

---

## 📊 Status

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**License**: MIT  

---

## 🆘 Need Help?

1. **Quick Start**: [`QUICKSTART.md`](QUICKSTART.md)
2. **Full Docs**: [`README.md`](README.md)
3. **Deployment**: [`DEPLOYMENT.md`](DEPLOYMENT.md)
4. **Checklist**: [`CHECKLIST.md`](CHECKLIST.md)

---

## 🎉 Next Steps

1. **Read**: [`QUICKSTART.md`](QUICKSTART.md)
2. **Setup**: Create Supabase & Resend accounts
3. **Configure**: Add environment variables
4. **Run**: `npm run dev`
5. **Deploy**: Follow [`DEPLOYMENT.md`](DEPLOYMENT.md)

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, Supabase, and Resend**

**Ready to deploy to Vercel! 🚀**
