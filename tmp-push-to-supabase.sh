#!/bin/bash
cd "$(dirname "$0")"
export DATABASE_URL="postgresql://postgres.byitvkqkckhusyiiwdmz:PoscalDB2024!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
npx prisma db push --accept-data-loss
