# Supabase Deployment Guide

## 1. Your Supabase Connection String

```
postgresql://postgres.byitvkqkckhusyiiwdmz:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Get your password from Supabase Dashboard > Settings > Database > Connection details.

## 2. Environment Variables for Vercel

In your Vercel project settings, add these environment variables:

```
DATABASE_URL = postgresql://postgres.byitvkqkckhusyiiwdmz:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
BETTER_AUTH_SECRET = [Generate a random 32+ character string]
BETTER_AUTH_URL = https://[your-vercel-app].vercel.app
NEXT_PUBLIC_APP_URL = https://[your-vercel-app].vercel.app
```

## 3. Generate Better Auth Secret

```bash
openssl rand -base64 32
```

## 4. Push Schema to Supabase

```bash
# Option A: Using Supabase CLI
npx supabase link --project-ref aws-1-ap-southeast-1
npx supabase db push

# Option B: Using Prisma directly
DATABASE_URL="postgresql://postgres.byitvkqkckhusyiiwdmz:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres" npx prisma db push
```

## 5. Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Add environment variables from step 2
5. Deploy

## 6. Verify Deployment

Check your app at `https://[your-vercel-app].vercel.app`
