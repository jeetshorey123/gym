# Database Setup Instructions

## 🗄️ Supabase Database Setup

The gym training application requires a Supabase database with the complete schema. Follow these steps to set up the database:

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/ddktxmfbdqrrnynuzoyl

2. **Navigate to SQL Editor**: 
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Execute the Schema**:
   - Copy the entire contents of `supabase_schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the schema

4. **Verify Tables Created**:
   - Go to "Table Editor" in the sidebar
   - You should see these tables:
     - `users`
     - `exercise_categories`
     - `exercises`
     - `workout_sessions`
     - `exercise_sets`
     - `user_weights`
     - `workout_templates`
     - `template_exercises`
     - `user_preferences`
     - `exercise_progress`

### Option 2: Using Supabase CLI (Advanced)

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login and Connect**:
   ```bash
   supabase login
   supabase link --project-ref ddktxmfbdqrrnynuzoyl
   ```

3. **Run Migration**:
   ```bash
   supabase db push
   ```

### 🔐 Database Security

The schema includes Row Level Security (RLS) policies:

- **Users can only access their own data**
- **Automatic user isolation for all operations**
- **Secure workout and progress tracking**

### 📊 Sample Data

The schema includes sample data for:

- **Exercise Categories**: warmup, chest, back, shoulders, arms, legs, core, glutes, stretches
- **Exercise Database**: 200+ exercises with proper categorization
- **User Accounts**: Predefined gym users (priya, jeet, anuj, etc.)

### 🚀 Features Enabled

After running the schema, the application will support:

- ✅ User authentication and profiles
- ✅ Exercise tracking with sets/reps/weight
- ✅ Workout session management
- ✅ Progress analytics and charts
- ✅ Weight tracking over time
- ✅ Exercise history with edit/delete
- ✅ Body part and exercise-specific progress
- ✅ Automatic progress calculations

### 🔧 Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ddktxmfbdqrrnynuzoyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka3R4bWZiZHFycm55bnV6b3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NzE4NjIsImV4cCI6MjA1MzE0Nzg2Mn0.bElylJQw2xmrJhGznLCE2Fj1wznNNPPBHK_rqcSQYBQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka3R4bWZiZHFycm55bnV6b3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU3MTg2MiwiZXhwIjoyMDUzMTQ3ODYyfQ.Fw8s5J3GKhb6Z7N4UVHnJ7-mS2SXB_Fb8C0vQsqQT_E
```

### 📞 Support

If you encounter any issues:

1. Check the Supabase project dashboard for errors
2. Verify all environment variables are set correctly
3. Ensure the SQL schema executed without errors
4. Check the browser console for any connection issues

---

**✨ Ready to track your gym progress with a professional database!**