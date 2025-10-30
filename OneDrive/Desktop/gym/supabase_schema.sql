-- =====================================================
-- GYM TRAINING TRACKER - COMPLETE SUPABASE SQL SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash TEXT,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. EXERCISE CATEGORIES TABLE
-- =====================================================
CREATE TABLE public.exercise_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. EXERCISES TABLE (Exercise Database)
-- =====================================================
CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES public.exercise_categories(id),
    body_part VARCHAR(50) NOT NULL,
    description TEXT,
    instructions TEXT,
    video_url TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    equipment_needed TEXT[],
    muscle_groups TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. WORKOUT SESSIONS TABLE
-- =====================================================
CREATE TABLE public.workout_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_name VARCHAR(100),
    workout_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    total_sets INTEGER DEFAULT 0,
    total_reps INTEGER DEFAULT 0,
    total_volume_kg DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. EXERCISE SETS TABLE (Individual Sets Data)
-- =====================================================
CREATE TABLE public.exercise_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(100) NOT NULL, -- Denormalized for performance
    body_part VARCHAR(50) NOT NULL,
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight_kg DECIMAL(8,2) NOT NULL DEFAULT 0,
    rest_time_seconds INTEGER,
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. USER WEIGHT TRACKING TABLE
-- =====================================================
CREATE TABLE public.user_weights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    recorded_date DATE NOT NULL,
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recorded_date)
);

-- =====================================================
-- 7. WORKOUT TEMPLATES TABLE
-- =====================================================
CREATE TABLE public.workout_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    target_body_parts TEXT[],
    estimated_duration_minutes INTEGER,
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TEMPLATE EXERCISES TABLE
-- =====================================================
CREATE TABLE public.template_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id),
    exercise_order INTEGER NOT NULL,
    target_sets INTEGER DEFAULT 3,
    target_reps_min INTEGER DEFAULT 8,
    target_reps_max INTEGER DEFAULT 12,
    target_weight_kg DECIMAL(8,2),
    rest_time_seconds INTEGER DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    preferred_units VARCHAR(10) DEFAULT 'metric', -- metric or imperial
    default_rest_time_seconds INTEGER DEFAULT 60,
    workout_reminder_time TIME,
    weekly_workout_goal INTEGER DEFAULT 3,
    preferred_workout_days TEXT[],
    notifications_enabled BOOLEAN DEFAULT TRUE,
    privacy_level VARCHAR(20) DEFAULT 'private',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. EXERCISE PROGRESS TRACKING TABLE
-- =====================================================
CREATE TABLE public.exercise_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id),
    exercise_name VARCHAR(100) NOT NULL,
    max_weight_kg DECIMAL(8,2) DEFAULT 0,
    max_reps INTEGER DEFAULT 0,
    total_volume_kg DECIMAL(12,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    last_performed_date DATE,
    personal_best_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Exercise sets indexes
CREATE INDEX idx_exercise_sets_user_date ON public.exercise_sets(user_id, created_at);
CREATE INDEX idx_exercise_sets_exercise_name ON public.exercise_sets(exercise_name);
CREATE INDEX idx_exercise_sets_body_part ON public.exercise_sets(body_part);
CREATE INDEX idx_exercise_sets_workout_session ON public.exercise_sets(workout_session_id);

-- Workout sessions indexes
CREATE INDEX idx_workout_sessions_user_date ON public.workout_sessions(user_id, workout_date);
CREATE INDEX idx_workout_sessions_date ON public.workout_sessions(workout_date);

-- Exercise progress indexes
CREATE INDEX idx_exercise_progress_user ON public.exercise_progress(user_id);
CREATE INDEX idx_exercise_progress_exercise ON public.exercise_progress(exercise_id);

-- User weights indexes
CREATE INDEX idx_user_weights_user_date ON public.user_weights(user_id, recorded_date);

-- Exercises indexes
CREATE INDEX idx_exercises_body_part ON public.exercises(body_part);
CREATE INDEX idx_exercises_category ON public.exercises(category_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_sets_updated_at BEFORE UPDATE ON public.exercise_sets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON public.workout_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_progress_updated_at BEFORE UPDATE ON public.exercise_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION TO UPDATE EXERCISE PROGRESS
-- =====================================================
CREATE OR REPLACE FUNCTION update_exercise_progress()
RETURNS TRIGGER AS $$
DECLARE
    current_max_weight DECIMAL(8,2);
    current_max_reps INTEGER;
    current_total_volume DECIMAL(12,2);
    current_sessions INTEGER;
BEGIN
    -- Calculate current stats for this exercise
    SELECT 
        COALESCE(MAX(weight_kg), 0),
        COALESCE(MAX(reps), 0),
        COALESCE(SUM(weight_kg * reps), 0),
        COALESCE(COUNT(DISTINCT workout_session_id), 0)
    INTO 
        current_max_weight,
        current_max_reps,
        current_total_volume,
        current_sessions
    FROM public.exercise_sets 
    WHERE user_id = NEW.user_id AND exercise_name = NEW.exercise_name;

    -- Insert or update exercise progress
    INSERT INTO public.exercise_progress (
        user_id, 
        exercise_id, 
        exercise_name,
        max_weight_kg,
        max_reps,
        total_volume_kg,
        total_sessions,
        last_performed_date,
        personal_best_date
    ) VALUES (
        NEW.user_id,
        NEW.exercise_id,
        NEW.exercise_name,
        current_max_weight,
        current_max_reps,
        current_total_volume,
        current_sessions,
        CURRENT_DATE,
        CASE WHEN NEW.weight_kg = current_max_weight THEN CURRENT_DATE ELSE NULL END
    )
    ON CONFLICT (user_id, exercise_id) 
    DO UPDATE SET
        max_weight_kg = GREATEST(exercise_progress.max_weight_kg, current_max_weight),
        max_reps = GREATEST(exercise_progress.max_reps, current_max_reps),
        total_volume_kg = current_total_volume,
        total_sessions = current_sessions,
        last_performed_date = CURRENT_DATE,
        personal_best_date = CASE 
            WHEN current_max_weight > exercise_progress.max_weight_kg THEN CURRENT_DATE 
            ELSE exercise_progress.personal_best_date 
        END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update exercise progress
CREATE TRIGGER update_exercise_progress_trigger
    AFTER INSERT OR UPDATE ON public.exercise_sets
    FOR EACH ROW EXECUTE FUNCTION update_exercise_progress();

-- =====================================================
-- FUNCTION TO UPDATE WORKOUT SESSION TOTALS
-- =====================================================
CREATE OR REPLACE FUNCTION update_workout_session_totals()
RETURNS TRIGGER AS $$
DECLARE
    session_totals RECORD;
BEGIN
    -- Calculate totals for the workout session
    SELECT 
        COALESCE(COUNT(*), 0) as total_sets,
        COALESCE(SUM(reps), 0) as total_reps,
        COALESCE(SUM(weight_kg * reps), 0) as total_volume
    INTO session_totals
    FROM public.exercise_sets 
    WHERE workout_session_id = COALESCE(NEW.workout_session_id, OLD.workout_session_id);

    -- Update the workout session
    UPDATE public.workout_sessions 
    SET 
        total_sets = session_totals.total_sets,
        total_reps = session_totals.total_reps,
        total_volume_kg = session_totals.total_volume,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.workout_session_id, OLD.workout_session_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update workout session totals
CREATE TRIGGER update_workout_session_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.exercise_sets
    FOR EACH ROW EXECUTE FUNCTION update_workout_session_totals();

-- =====================================================
-- INSERT INITIAL DATA
-- =====================================================

-- Insert exercise categories
INSERT INTO public.exercise_categories (name, description) VALUES
('Warm-up', 'Exercises to prepare the body for workout'),
('Chest', 'Exercises targeting chest muscles'),
('Back', 'Exercises targeting back muscles'),
('Shoulders', 'Exercises targeting shoulder muscles'),
('Arms', 'Exercises targeting arm muscles (biceps, triceps)'),
('Legs', 'Exercises targeting leg muscles'),
('Core', 'Exercises targeting core and abdominal muscles'),
('Glutes', 'Exercises targeting glute muscles'),
('Stretches', 'Cool-down and flexibility exercises');

-- Insert sample users (predefined users from your app)
INSERT INTO public.users (username, full_name) VALUES
('priya', 'Priya'),
('jeet', 'Jeet'),
('anuj', 'Anuj'),
('ankur', 'Ankur'),
('shreya', 'Shreya'),
('hait', 'Hait'),
('veer', 'Veer'),
('druav', 'Druav');

-- Insert comprehensive exercise database
INSERT INTO public.exercises (name, body_part, category_id, description) VALUES
-- Warm-up exercises
('Arm Circles Forward', 'warmup', (SELECT id FROM exercise_categories WHERE name = 'Warm-up'), 'Forward arm circles for shoulder mobility'),
('Arm Circles Backward', 'warmup', (SELECT id FROM exercise_categories WHERE name = 'Warm-up'), 'Backward arm circles for shoulder mobility'),
('Jumping Jacks', 'warmup', (SELECT id FROM exercise_categories WHERE name = 'Warm-up'), 'Full body warm-up exercise'),
('High Knees', 'warmup', (SELECT id FROM exercise_categories WHERE name = 'Warm-up'), 'Dynamic leg warm-up'),
('Bodyweight Squats', 'warmup', (SELECT id FROM exercise_categories WHERE name = 'Warm-up'), 'Lower body activation'),

-- Chest exercises
('Flat Bench Press (Barbell)', 'chest', (SELECT id FROM exercise_categories WHERE name = 'Chest'), 'Primary chest building exercise'),
('Incline Bench Press (Barbell)', 'chest', (SELECT id FROM exercise_categories WHERE name = 'Chest'), 'Upper chest focus'),
('Decline Bench Press (Barbell)', 'chest', (SELECT id FROM exercise_categories WHERE name = 'Chest'), 'Lower chest focus'),
('Flat Bench Press (Dumbbell)', 'chest', (SELECT id FROM exercise_categories WHERE name = 'Chest'), 'Chest exercise with dumbbells'),
('Push-ups', 'chest', (SELECT id FROM exercise_categories WHERE name = 'Chest'), 'Bodyweight chest exercise'),

-- Back exercises
('Pull-ups', 'back', (SELECT id FROM exercise_categories WHERE name = 'Back'), 'Upper body pulling exercise'),
('Chin-ups', 'back', (SELECT id FROM exercise_categories WHERE name = 'Back'), 'Bicep-focused pulling exercise'),
('Lat Pulldowns', 'back', (SELECT id FROM exercise_categories WHERE name = 'Back'), 'Lat development exercise'),
('Barbell Rows', 'back', (SELECT id FROM exercise_categories WHERE name = 'Back'), 'Middle back strength'),
('Deadlifts', 'back', (SELECT id FROM exercise_categories WHERE name = 'Back'), 'Full posterior chain exercise'),

-- Shoulder exercises
('Overhead Press (Barbell)', 'shoulders', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), 'Primary shoulder building exercise'),
('Overhead Press (Dumbbell)', 'shoulders', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), 'Shoulder press with dumbbells'),
('Lateral Raises', 'shoulders', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), 'Side deltoid isolation'),
('Front Raises', 'shoulders', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), 'Front deltoid isolation'),
('Rear Delt Flyes', 'shoulders', (SELECT id FROM exercise_categories WHERE name = 'Shoulders'), 'Rear deltoid development'),

-- Arm exercises
('Barbell Curls', 'arms', (SELECT id FROM exercise_categories WHERE name = 'Arms'), 'Bicep development'),
('Dumbbell Curls', 'arms', (SELECT id FROM exercise_categories WHERE name = 'Arms'), 'Bicep isolation'),
('Tricep Dips', 'arms', (SELECT id FROM exercise_categories WHERE name = 'Arms'), 'Tricep bodyweight exercise'),
('Close-Grip Bench Press', 'arms', (SELECT id FROM exercise_categories WHERE name = 'Arms'), 'Tricep focus bench press'),
('Hammer Curls', 'arms', (SELECT id FROM exercise_categories WHERE name = 'Arms'), 'Bicep and forearm development'),

-- Leg exercises
('Squats (Barbell)', 'legs', (SELECT id FROM exercise_categories WHERE name = 'Legs'), 'Primary leg building exercise'),
('Leg Press', 'legs', (SELECT id FROM exercise_categories WHERE name = 'Legs'), 'Machine-based leg exercise'),
('Lunges', 'legs', (SELECT id FROM exercise_categories WHERE name = 'Legs'), 'Unilateral leg exercise'),
('Leg Curls', 'legs', (SELECT id FROM exercise_categories WHERE name = 'Legs'), 'Hamstring isolation'),
('Calf Raises', 'legs', (SELECT id FROM exercise_categories WHERE name = 'Legs'), 'Calf muscle development'),

-- Core exercises
('Plank', 'core', (SELECT id FROM exercise_categories WHERE name = 'Core'), 'Core stability exercise'),
('Crunches', 'core', (SELECT id FROM exercise_categories WHERE name = 'Core'), 'Abdominal muscle exercise'),
('Russian Twists', 'core', (SELECT id FROM exercise_categories WHERE name = 'Core'), 'Oblique strengthening'),
('Mountain Climbers', 'core', (SELECT id FROM exercise_categories WHERE name = 'Core'), 'Dynamic core exercise'),
('Dead Bug', 'core', (SELECT id FROM exercise_categories WHERE name = 'Core'), 'Core stability and coordination'),

-- Glute exercises
('Hip Thrusts', 'glutes', (SELECT id FROM exercise_categories WHERE name = 'Glutes'), 'Primary glute building exercise'),
('Glute Bridges', 'glutes', (SELECT id FROM exercise_categories WHERE name = 'Glutes'), 'Bodyweight glute exercise'),
('Bulgarian Split Squats', 'glutes', (SELECT id FROM exercise_categories WHERE name = 'Glutes'), 'Unilateral glute and leg exercise'),
('Clamshells', 'glutes', (SELECT id FROM exercise_categories WHERE name = 'Glutes'), 'Glute activation exercise'),
('Fire Hydrants', 'glutes', (SELECT id FROM exercise_categories WHERE name = 'Glutes'), 'Glute isolation exercise'),

-- Stretch exercises
('Hamstring Stretch', 'stretches', (SELECT id FROM exercise_categories WHERE name = 'Stretches'), 'Hamstring flexibility'),
('Quad Stretch', 'stretches', (SELECT id FROM exercise_categories WHERE name = 'Stretches'), 'Quadriceps flexibility'),
('Shoulder Stretch', 'stretches', (SELECT id FROM exercise_categories WHERE name = 'Stretches'), 'Shoulder flexibility'),
('Chest Stretch', 'stretches', (SELECT id FROM exercise_categories WHERE name = 'Stretches'), 'Chest muscle flexibility'),
('Cat-Cow Stretch', 'stretches', (SELECT id FROM exercise_categories WHERE name = 'Stretches'), 'Spinal mobility stretch');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - DISABLED FOR DEVELOPMENT
-- =====================================================

-- Note: For simplicity in development, we'll disable RLS and rely on application-level security
-- In production, you would want to enable RLS with proper policies

-- Disable RLS on user-specific tables for now
ALTER TABLE public.workout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_weights DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_progress DISABLE ROW LEVEL SECURITY;

-- For production use, enable RLS and create policies based on user_id matching
-- Example policies (commented out):
/*
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own workout sessions" ON public.workout_sessions
    FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

-- Similar policies would be needed for other tables
*/

-- =====================================================
-- USEFUL VIEWS FOR ANALYTICS
-- =====================================================

-- View for user workout summary
CREATE VIEW user_workout_summary AS
SELECT 
    u.username,
    u.full_name,
    COUNT(DISTINCT ws.id) as total_workouts,
    COUNT(es.id) as total_sets,
    SUM(es.reps) as total_reps,
    SUM(es.weight_kg * es.reps) as total_volume_kg,
    AVG(ws.duration_minutes) as avg_workout_duration,
    MAX(ws.workout_date) as last_workout_date
FROM public.users u
LEFT JOIN public.workout_sessions ws ON u.id = ws.user_id
LEFT JOIN public.exercise_sets es ON ws.id = es.workout_session_id
GROUP BY u.id, u.username, u.full_name;

-- View for exercise popularity
CREATE VIEW exercise_popularity AS
SELECT 
    e.name,
    e.body_part,
    COUNT(es.id) as times_performed,
    COUNT(DISTINCT es.user_id) as unique_users,
    AVG(es.weight_kg) as avg_weight,
    AVG(es.reps) as avg_reps
FROM public.exercises e
LEFT JOIN public.exercise_sets es ON e.id = es.exercise_id
GROUP BY e.id, e.name, e.body_part
ORDER BY times_performed DESC;

-- =====================================================
-- SAMPLE QUERIES FOR YOUR APPLICATION
-- =====================================================

-- Query to get user's recent workouts
/*
SELECT 
    ws.workout_date,
    ws.session_name,
    ws.duration_minutes,
    ws.total_sets,
    ws.total_reps,
    ws.total_volume_kg
FROM workout_sessions ws
WHERE ws.user_id = $1
ORDER BY ws.workout_date DESC
LIMIT 10;
*/

-- Query to get exercise sets for a specific date and user
/*
SELECT 
    es.exercise_name,
    es.body_part,
    es.set_number,
    es.reps,
    es.weight_kg,
    es.created_at
FROM exercise_sets es
JOIN workout_sessions ws ON es.workout_session_id = ws.id
WHERE ws.user_id = $1 
AND ws.workout_date = $2
ORDER BY es.created_at;
*/

-- Query to get exercise progress for a user
/*
SELECT 
    ep.exercise_name,
    ep.max_weight_kg,
    ep.max_reps,
    ep.total_volume_kg,
    ep.total_sessions,
    ep.last_performed_date,
    ep.personal_best_date
FROM exercise_progress ep
WHERE ep.user_id = $1
ORDER BY ep.total_volume_kg DESC;
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================