# 🚀 Deployment Guide - Badge Delivery Platform

This guide will walk you through deploying the Badge Delivery Platform to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase project set up
- Resend API key

## Step 1: Prepare Your Supabase Project

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created

### 1.2 Set Up Database

1. Go to SQL Editor in Supabase Dashboard
2. Copy contents from `supabase-schema.sql`
3. Paste and execute the SQL

### 1.3 Configure Storage

1. Go to Storage section
2. Create new bucket: `badge-images`
3. Set to **Private**
4. Add RLS policies (see `supabase-schema.sql`)

### 1.4 Get API Keys

1. Go to Project Settings > API
2. Copy:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon/Public Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) ⚠️ Keep secret!

### 1.5 Configure Auth Settings

1. Go to Authentication > URL Configuration
2. Add your Vercel domain to:
   - Site URL
   - Redirect URLs
   - Additional Redirect URLs

## Step 2: Set Up Resend

### 2.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### 2.2 Get API Key

1. Go to API Keys section
2. Create new API key
3. Copy the key (`RESEND_API_KEY`)

### 2.3 Configure Domain (Optional)

For production, add your custom domain:
1. Go to Domains section
2. Add and verify your domain
3. Update email `from` address in `/app/api/send-badge-email/route.ts`

## Step 3: Push to GitHub

### 3.1 Initialize Git Repository

```bash
cd c:\Users\lenovo\Desktop\badges
git init
git add .
git commit -m "Initial commit: Badge Delivery Platform"
```

### 3.2 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New Repository"
3. Name it (e.g., `badge-delivery-platform`)
4. Don't initialize with README (we already have one)
5. Click "Create Repository"

### 3.3 Push Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/badge-delivery-platform.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository you just created

### 4.2 Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./`

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

### 4.3 Add Environment Variables

Click "Environment Variables" and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

⚠️ **Important**: 
- Don't add quotes around values
- `NEXT_PUBLIC_APP_URL` will be your Vercel domain (update after first deploy)

### 4.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (2-3 minutes)
3. You'll get a URL like `https://your-project.vercel.app`

## Step 5: Post-Deployment Configuration

### 5.1 Update Environment Variables

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
3. Redeploy (Deployments > ... > Redeploy)

### 5.2 Update Supabase Auth URLs

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Update:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: Add `https://your-project.vercel.app/**`

### 5.3 Update Next.js Config

Update `next.config.js` with your Supabase domain:

```javascript
const nextConfig = {
  images: {
    domains: ['your-project-id.supabase.co'],
  },
}
```

Commit and push:

```bash
git add next.config.js
git commit -m "Update Supabase domain"
git push
```

Vercel will auto-deploy the changes.

## Step 6: Test Your Deployment

### 6.1 Test Authentication

1. Visit `https://your-project.vercel.app`
2. Click "Sign Up"
3. Create a test account
4. Verify you can sign in

### 6.2 Test Badge Creation (API)

Use Postman or curl:

```bash
curl -X POST https://your-project.vercel.app/api/badges \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "your-test-email@example.com",
    "badge_name": "Test Badge",
    "badge_description": "Testing badge creation",
    "event_name": "Test Event"
  }'
```

### 6.3 Test Email Sending

```bash
curl -X POST https://your-project.vercel.app/api/send-badge-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "your-test-email@example.com",
    "badge_name": "Test Badge",
    "event_name": "Test Event"
  }'
```

### 6.4 Verify Dashboard

1. Sign in to your account
2. Check if badges appear in dashboard
3. Verify responsive design on mobile

## Step 7: Custom Domain (Optional)

### 7.1 Add Domain in Vercel

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 7.2 Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 7.3 Update Supabase

Add custom domain to Supabase Auth URLs

### 7.4 Update Resend (if using custom domain)

Configure and verify your domain in Resend

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally first

**Error**: `Environment variable not found`
- **Solution**: Check all env vars are added in Vercel
- Ensure no typos in variable names

### Authentication Issues

**Error**: `Invalid redirect URL`
- **Solution**: Add Vercel URL to Supabase Auth URLs
- Check for trailing slashes

**Error**: `User not found`
- **Solution**: Ensure database schema is set up correctly
- Check RLS policies are active

### Email Not Sending

**Error**: `Resend API error`
- **Solution**: Verify API key is correct
- Check Resend account is active
- For production, verify domain in Resend

### Images Not Loading

**Error**: `Invalid src prop`
- **Solution**: Add Supabase domain to `next.config.js`
- Redeploy after config change

## Monitoring

### Vercel Analytics

1. Go to Project > Analytics
2. Monitor:
   - Page views
   - Performance
   - Errors

### Supabase Logs

1. Go to Supabase Dashboard > Logs
2. Monitor:
   - Database queries
   - Auth events
   - Storage access

### Error Tracking

Check Vercel deployment logs:
1. Go to Deployments
2. Click on latest deployment
3. View "Functions" tab for API errors

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Vercel will automatically deploy
```

## Security Checklist

- ✅ Environment variables are set in Vercel (not in code)
- ✅ Service role key is kept secret
- ✅ RLS policies are enabled on Supabase
- ✅ Storage buckets are private
- ✅ HTTPS is enforced (automatic on Vercel)
- ✅ Auth URLs are properly configured

## Production Checklist

Before going live:

- [ ] Test all user flows
- [ ] Verify email sending works
- [ ] Check mobile responsiveness
- [ ] Test badge creation and display
- [ ] Verify authentication works
- [ ] Check all environment variables
- [ ] Test API endpoints
- [ ] Review Supabase RLS policies
- [ ] Set up custom domain (optional)
- [ ] Configure error monitoring
- [ ] Test with real users

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Review this deployment guide
4. Check the main README.md

---

**Congratulations! Your Badge Delivery Platform is now live! 🎉**
