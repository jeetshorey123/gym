# 🏋️‍♂️ Gym Training Website

A comprehensive gym training website built with Next.js, TypeScript, Tailwind CSS, and Supabase integration.

## ✨ Features

- 👤 **User Authentication** - Predefined users (priya, jeet, anuj, ankur, shreya, hait, veer, druav)
- 📅 **Weekly Workout Schedule** - 5 different training days
- 🎯 **Exercise Selection** - Choose exercises by body part with video links
- 📊 **Exercise Tracking** - Track sets, reps, and weights
- 🥗 **Diet Planning** - Nutrition management section
- 📈 **Weight Tracking** - Monitor weight progress over time
- 📱 **Mobile Responsive** - Modern UI design
- 📉 **Progress Analytics** - 5 view modes (overview, bodypart, exercise, timeline, 3D body)
- 🗓️ **Calendar View** - Date-wise workout management
- 📋 **Excel Export** - Comprehensive data analysis export
- 🎨 **3D Body Visualization** - Muscle heat mapping
- 🎥 **Exercise Videos** - Tutorial links for all exercises

## 🛠️ Technology Stack

- **Frontend**: Next.js 16.0.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 🚀 Vercel Deployment

### 1. Build Configuration

The project uses `vercel.json` for deployment configuration:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install", 
  "framework": "nextjs",
  "outputDirectory": ".next",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

### 2. Environment Variables Setup

**CRITICAL**: Add these environment variables in Vercel Dashboard:

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ddktxmfbdqrrnynuzoyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka3R4bWZiZHFycm55bnV6b3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDM3ODksImV4cCI6MjA3NzMxOTc4OX0.dR0aaU1EI_Uev8P3qqnWrsA4JLgnbzkGaAkqdPV8hK0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka3R4bWZiZHFycm55bnV6b3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc0Mzc4OSwiZXhwIjoyMDc3MzE5Nzg5fQ.DXpdN976v33SYcFaNswgZFoLIqiWMOJm2sFDN3CAXvM
LOCAL_DEV_MODE=false
```

### 3. Database Schema Deployment

**REQUIRED**: Deploy the database schema to Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ddktxmfbdqrrnynuzoyl)
2. Navigate to **SQL Editor**
3. Copy and paste the entire content of `supabase_schema.sql`
4. Click **RUN** to execute the schema

### 4. Deployment Process

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Auto-Deploy**: Vercel will automatically detect Next.js and use the build configuration
3. **Environment Variables**: Ensure all 4 environment variables are added
4. **Database Schema**: Deploy the SQL schema to Supabase
5. **Redeploy**: Force redeploy after adding environment variables

## 🔧 Local Development

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jeetshorey123/gym.git
cd gym
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

```
gym/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main workout dashboard
│   │   ├── login/              # Authentication page
│   │   ├── db-test/            # Database health check
│   │   └── setup/              # Initial setup page
│   ├── components/             # React components
│   │   ├── ExerciseTracker.tsx # Main workout tracking
│   │   ├── ProgressChart.tsx   # Analytics and charts
│   │   ├── ExerciseHistory.tsx # Workout history
│   │   ├── WeightTracker.tsx   # Weight monitoring
│   │   └── DietPlanner.tsx     # Nutrition planning
│   └── lib/                    # Utilities and services
│       ├── supabase/           # Database services
│       └── localStorage.ts     # Local storage utilities
├── public/                     # Static assets
├── supabase_schema.sql         # Database schema
├── vercel.json                 # Deployment configuration
└── package.json                # Dependencies
```

## 🔐 User Authentication

Default users with custom passwords:
- **priya**: "elephant"
- **jeet**: "jeet@123"
- **anuj, ankur, shreya, hait, veer, druav**: Default passwords

## 📊 Analytics Features

### Progress Views:
1. **Overview**: Complete workout summary
2. **Bodypart**: Filter by muscle groups
3. **Exercise**: Individual exercise analysis
4. **Timeline**: Progress over time
5. **3D Body**: Muscle heat mapping

### Export Options:
- **Basic Data**: Essential workout information
- **Chart Data**: Analytics and metrics
- **Complete Analysis**: Comprehensive 15+ sheet Excel export

## 🔍 Troubleshooting

### Common Issues:

1. **404 NOT_FOUND Errors**:
   - Ensure environment variables are set in Vercel
   - Check that database schema is deployed
   - Verify build command is `npm run build`

2. **Database Connection Fails**:
   - Deploy `supabase_schema.sql` in Supabase dashboard
   - Verify environment variables are correct
   - Check Supabase project is active

3. **Build Failures**:
   - Run `npm run build` locally to test
   - Check all dependencies are in `package.json`
   - Verify TypeScript compilation

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure database schema is deployed
4. Test locally with production build

## 🎯 Deployment Checklist

- [ ] Environment variables added to Vercel
- [ ] Database schema deployed to Supabase
- [ ] Latest code pushed to GitHub
- [ ] Vercel auto-deployment successful
- [ ] Application accessible without errors

## 📄 License

This project is created for educational purposes.

---

**🏋️‍♂️ Ready to track your fitness journey? Deploy now!**
