#!/bin/bash

# Vercel Deployment Debug Script
echo "🔍 Checking deployment status..."

# Check environment variables
echo "📊 Environment Variables:"
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:20}..."
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."

# Check build
echo "🏗️ Building application..."
npm run build

echo "✅ Deployment check complete!"