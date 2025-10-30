# 🚀 Vercel Deployment Guide for Gym App

## ⚠️ Current Error Fix

If you're seeing `404: NOT_FOUND` errors with IDs like `bom1::trw9p-1761831733057-4ee2b990c004`, follow these steps:

## 🔧 Step 1: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **gym** project
3. Navigate to **Settings** → **Environment Variables**
4. Add these variables:

### Required Environment Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ddktxmfbdqrrnynuzoyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka3R4bWZiZHFycm55bnV6b3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDM3ODksImV4cCI6MjA3NzMxOTc4OX0.dR0aaU1EI_Uev8P3qqnWrsA4JLgnbzkGaAkqdPV8hK0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka3R4bWZiZHFycm55bnV6b3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc0Mzc4OSwiZXhwIjoyMDc3MzE5Nzg5fQ.DXpdN976v33SYcFaNswgZFoLIqiWMOJm2sFDN3CAXvM
LOCAL_DEV_MODE=false
```

## 🔧 Step 2: Deploy Database Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project: **ddktxmfbdqrrnynuzoyl**
3. Navigate to **SQL Editor**
4. Copy and paste the entire content of `supabase_schema.sql`
5. Click **RUN** to execute the schema

## 🔧 Step 3: Force Redeploy

1. In Vercel Dashboard → **Deployments**
2. Click on the latest deployment
3. Click **Redeploy** button
4. Or push a new commit to trigger automatic deployment

## 🔧 Step 4: Verify Build Settings

Ensure these settings in Vercel:
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x or 20.x
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 🔧 Step 5: Check Build Logs

If still getting 404 errors:
1. Go to Vercel Dashboard → **Deployments**
2. Click on the failing deployment
3. Check **Build Logs** for errors
4. Look for missing dependencies or build failures

## 🔍 Common Issues & Solutions

### Issue: Build Fails
- **Solution**: Ensure all dependencies are in `package.json`
- **Check**: Build logs for missing packages

### Issue: Environment Variables Not Loading
- **Solution**: Redeploy after adding env vars
- **Check**: Variables are set in Vercel dashboard

### Issue: Database Connection Fails
- **Solution**: Deploy the SQL schema first
- **Check**: Supabase project is active

### Issue: Routing Not Working
- **Solution**: `vercel.json` is properly configured
- **Check**: Catch-all routes are set up

## 📞 Support

If you continue to have issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure database schema is deployed
4. Test locally with `npm run build` && `npm start`

## 🎯 Final Checklist

- [ ] Environment variables added to Vercel
- [ ] Database schema deployed to Supabase  
- [ ] Latest code pushed to GitHub
- [ ] Vercel redeployed successfully
- [ ] Application accessible without 404 errors

Your gym app should now be fully deployed and functional! 🏋️‍♂️