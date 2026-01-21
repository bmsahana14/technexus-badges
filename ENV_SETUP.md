# 📋 Environment Variables Setup Guide

This guide explains all environment variables needed for the Badge Delivery Platform.

## Required Environment Variables

### 1. Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description**: Your Supabase project URL
- **Where to find**: Supabase Dashboard → Project Settings → API → Project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Public**: Yes (safe to expose in browser)

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Supabase anonymous/public key for client-side operations
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → anon/public
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Public**: Yes (safe to expose in browser)

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Description**: Supabase service role key for server-side operations
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → service_role
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Public**: ⚠️ **NO** - Keep this secret! Only use server-side
- **Security**: Never commit to Git, never expose in browser

### 2. Email Service (Resend)

#### `RESEND_API_KEY`
- **Description**: API key for sending emails via Resend
- **Where to find**: Resend Dashboard → API Keys
- **Example**: `re_123456789abcdefghijklmnop`
- **Public**: ⚠️ **NO** - Keep this secret!

### 3. Application Configuration

#### `NEXT_PUBLIC_APP_URL`
- **Description**: Your application's public URL
- **Development**: `http://localhost:3002`
- **Production**: `https://your-domain.vercel.app`
- **Public**: Yes

#### `NEXT_PUBLIC_ADMIN_EMAILS`
- **Description**: Comma-separated list of emails authorized to access the Admin Console
- **Example**: `admin@example.com,manager@technexus.com`
- **Public**: Yes (used for client-side access checks)
- **Note**: Ensure you use the exact email address used for sign-up.

## Setup Instructions

### Local Development

1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
RESEND_API_KEY=your-resend-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Restart your development server:
```bash
npm run dev
```

### Vercel Deployment

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add each variable:
   - Click "Add New"
   - Enter variable name
   - Enter value
   - Select environments (Production, Preview, Development)
   - Click "Save"

3. Add all variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```

4. Redeploy your application

## Validation

### Check if Variables are Loaded

Create a test page to verify (remove after testing):

```typescript
// app/test-env/page.tsx
export default function TestEnv() {
  return (
    <div>
      <h1>Environment Variables Test</h1>
      <ul>
        <li>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</li>
        <li>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</li>
        <li>App URL: {process.env.NEXT_PUBLIC_APP_URL ? '✅' : '❌'}</li>
      </ul>
    </div>
  )
}
```

Visit `/test-env` to check.

## Security Best Practices

### ✅ DO:
- Use `.env.local` for local development
- Add `.env.local` to `.gitignore`
- Use Vercel's environment variable UI for production
- Prefix public variables with `NEXT_PUBLIC_`
- Rotate keys if accidentally exposed

### ❌ DON'T:
- Commit `.env.local` to Git
- Share service role keys
- Expose secret keys in client-side code
- Use production keys in development
- Hardcode sensitive values

## Troubleshooting

### Variables Not Loading

**Problem**: `undefined` when accessing env variables

**Solutions**:
1. Ensure `.env.local` exists in root directory
2. Restart development server after adding variables
3. Check variable names match exactly (case-sensitive)
4. For client-side access, ensure `NEXT_PUBLIC_` prefix

### Vercel Deployment Issues

**Problem**: Variables work locally but not on Vercel

**Solutions**:
1. Verify all variables are added in Vercel dashboard
2. Check no typos in variable names
3. Ensure variables are enabled for correct environment
4. Redeploy after adding variables

### Supabase Connection Errors

**Problem**: Can't connect to Supabase

**Solutions**:
1. Verify URL format is correct (include `https://`)
2. Check keys are complete (very long strings)
3. Ensure project is not paused in Supabase
4. Verify RLS policies allow access

## Variable Reference Table

| Variable | Type | Required | Public | Where Used |
|----------|------|----------|--------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | String | Yes | Yes | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | Yes | Yes | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | String | Yes | No | Server only |
| `RESEND_API_KEY` | String | Yes | No | Server only |
| `NEXT_PUBLIC_APP_URL` | String | Yes | Yes | Client & Server |

## Getting Help

If you're having trouble with environment variables:

1. Check this guide thoroughly
2. Verify all values are correct
3. Check Vercel deployment logs
4. Review Next.js environment variable docs
5. Check Supabase and Resend dashboards

---

**Remember**: Never commit secrets to Git! 🔒
