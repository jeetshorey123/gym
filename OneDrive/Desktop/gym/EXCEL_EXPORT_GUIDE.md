# Excel Export & Vercel Configuration Guide

## Overview
This document explains the comprehensive Excel export functionality and Vercel deployment configuration implemented in the gym tracking application.

## Excel Export Features

### 1. Export Data Button (Green)
**Purpose**: Exports detailed exercise data with comprehensive analysis
**File Name**: `gym_data_[username]_[date].xlsx`

**Includes 5 Sheets**:
- **Exercise Details**: Complete log of all exercises with sets, reps, weights, volume calculations
- **Body Part Summary**: Analysis by body part including totals and averages
- **Exercise Progress**: Individual exercise progression over time
- **Daily Progress**: Day-by-day breakdown of volume, exercises, and sets
- **Weight Progress**: Body weight tracking over time (if available)

### 2. Export Charts Button (Blue)
**Purpose**: Exports chart-specific data optimized for creating graphs in Excel
**File Name**: `gym_charts_[username]_[date].xlsx`

**Includes 5 Sheets**:
- **Volume Over Time**: Timeline data for creating volume line charts
- **Daily Bar Chart**: Daily progress data for creating bar charts
- **Body Part Distribution**: Data for creating body part pie/bar charts
- **Weight Chart Data**: Weight progression data for line charts
- **Exercise Trends**: Trend analysis data for individual exercises

### 3. Export All Button (Purple)
**Purpose**: Comprehensive analysis with all data and advanced metrics
**File Name**: `gym_complete_analysis_[username]_[date].xlsx`

**Includes 7 Sheets**:
- **Complete Exercise Log**: Every exercise with enhanced metadata
- **Daily Progress**: Advanced daily metrics with moving averages
- **Body Part Analysis**: Detailed body part statistics and percentages
- **Exercise Progress**: Comprehensive progression tracking with percentages
- **Progress Timeline**: Timeline with moving averages and weekly totals
- **Weight Progress**: Complete weight tracking with BMI calculations
- **Weekly Summary**: Week-by-week performance analysis

## Data Fields Explained

### Exercise Data Fields
- **Date**: Exercise date in local format
- **Exercise Name**: Name of the exercise performed
- **Body Part**: Target muscle group
- **Set Number**: Individual set within the exercise
- **Reps**: Number of repetitions
- **Weight (kg)**: Weight used for the set
- **Volume (kg)**: Calculated as reps × weight
- **Day of Week**: Day name for pattern analysis
- **Week Number**: Week number for trend analysis

### Progress Analysis Fields
- **Moving Average Volume**: 7-day rolling average for trend smoothing
- **Change from Start**: Progress since first recorded session
- **Progress Trend**: Categorical assessment (Improving/Declining/Stable)
- **Sessions per Week**: Frequency analysis
- **Average Volume per Exercise**: Intensity metrics
- **Percentage of Total Volume**: Relative contribution analysis

### Weight Tracking Fields
- **BMI (estimated)**: Calculated assuming 175cm height
- **Change from Previous**: Session-to-session changes
- **Trend**: Direction of weight change

## Vercel.json Configuration

### Rewrites
URL rewrites for better SEO and user experience:
- `/gym` → `/` (homepage)
- `/workout`, `/training`, `/exercise` → `/dashboard`
- `/signin`, `/auth`, `/register` → `/login`
- `/user/:username` → `/login?user=:username`
- `/health`, `/status` → `/db-test`

### Redirects
Permanent redirects for common URLs:
- `/home`, `/index`, `/main` → `/` (301 redirects)

### Headers
Security and performance headers:
- **Security**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Performance**: Cache-Control for static assets and API responses
- **Privacy**: Permissions-Policy for camera/microphone

### Functions
- API routes configured with 30-second timeout
- Optimized for serverless deployment

### Environment Variables
- Supabase URL and keys configured for secure access
- Uses Vercel environment variable system

## Usage Instructions

### For Excel Analysis
1. **Basic Data Export**: Use "Export Data" for raw exercise logs
2. **Chart Creation**: Use "Export Charts" for graph-ready data
3. **Complete Analysis**: Use "Export All" for comprehensive reports

### Excel Chart Creation
1. Open exported chart data file
2. Select data range from appropriate sheet
3. Insert → Charts → Choose chart type:
   - **Line Charts**: Volume Over Time, Weight Progress
   - **Bar Charts**: Daily Progress, Body Part Distribution
   - **Scatter Plots**: Exercise Trends

### Vercel Deployment
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy using `vercel.json` configuration

## Data Analysis Recommendations

### Weekly Analysis
- Track volume trends using "Progress Timeline" sheet
- Compare body part distribution using "Body Part Analysis"
- Monitor consistency using "Weekly Summary"

### Monthly Analysis  
- Review exercise progression using "Exercise Progress" sheet
- Analyze weight changes using "Weight Progress" sheet
- Identify patterns using "Complete Exercise Log"

### Performance Optimization
- Use moving averages to identify true trends
- Focus on volume progression over time
- Balance body part training using distribution data

## File Organization
Exported files are automatically named with:
- User identification
- Export type (data/charts/complete)
- Date stamp for version control

## Technical Notes
- All calculations performed client-side for privacy
- Excel files use XLSX format for broad compatibility
- Data includes validation and error handling
- Supports multiple time ranges (week/month/all time)

## Troubleshooting
- **Empty exports**: Ensure you have exercise data recorded
- **Missing charts**: Check that you have sufficient data points
- **Download issues**: Verify browser allows file downloads
- **Vercel deployment**: Ensure environment variables are set correctly