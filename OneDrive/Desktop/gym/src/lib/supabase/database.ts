import { supabase } from './client'

// =====================================================
// USER OPERATIONS
// =====================================================

export interface User {
  id: string
  username: string
  email?: string
  full_name?: string
  created_at: string
  updated_at: string
}

export const getUser = async (username: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error) {
      // If no user found, that's normal, not an error
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching user:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return null
    }
    
    return data
  } catch (err) {
    console.error('Exception in getUser:', err)
    return null
  }
}

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return null
    }
    
    return data
  } catch (err) {
    console.error('Exception in createUser:', err)
    return null
  }
}

// =====================================================
// EXERCISE OPERATIONS
// =====================================================

export interface Exercise {
  id: string
  name: string
  category_id: string
  body_part: string
  description?: string
  instructions?: string
  video_url?: string
  difficulty_level: string
  equipment_needed?: string[]
  muscle_groups?: string[]
  created_at: string
  updated_at: string
}

export const getExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching exercises:', error)
    return []
  }
  
  return data || []
}

export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('body_part', bodyPart)
    .order('name')
  
  if (error) {
    console.error('Error fetching exercises by body part:', error)
    return []
  }
  
  return data || []
}

// =====================================================
// WORKOUT SESSION OPERATIONS
// =====================================================

export interface WorkoutSession {
  id: string
  user_id: string
  session_name?: string
  workout_date: string
  start_time?: string
  end_time?: string
  duration_minutes?: number
  total_sets: number
  total_reps: number
  total_volume_kg: number
  notes?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export const createWorkoutSession = async (sessionData: Omit<WorkoutSession, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutSession | null> => {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([sessionData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating workout session:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return null
    }
    
    return data
  } catch (err) {
    console.error('Exception in createWorkoutSession:', err)
    return null
  }
}

export const getWorkoutSessions = async (userId: string, startDate?: string, endDate?: string): Promise<WorkoutSession[]> => {
  let query = supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })
  
  if (startDate) {
    query = query.gte('workout_date', startDate)
  }
  
  if (endDate) {
    query = query.lte('workout_date', endDate)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching workout sessions:', error)
    return []
  }
  
  return data || []
}

export const updateWorkoutSession = async (sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession | null> => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating workout session:', error)
    return null
  }
  
  return data
}

export const deleteWorkoutSession = async (sessionId: string): Promise<boolean> => {
  console.log('Database: Attempting to delete workout session:', sessionId)
  
  try {
    // Delete the workout session (exercise sets will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)
    
    if (error) {
      console.error('Error deleting workout session:', error)
      return false
    }
    
    console.log('Database: Successfully deleted workout session:', sessionId)
    return true
  } catch (err) {
    console.error('Unexpected error deleting workout session:', err)
    return false
  }
}

// =====================================================
// EXERCISE SET OPERATIONS
// =====================================================

export interface ExerciseSet {
  id: string
  workout_session_id: string
  exercise_id?: string
  user_id: string
  exercise_name: string
  body_part: string
  set_number: number
  reps: number
  weight_kg: number
  rest_time_seconds?: number
  difficulty_rating?: number
  notes?: string
  created_at: string
  updated_at: string
}

export const saveExerciseSet = async (setData: Omit<ExerciseSet, 'id' | 'created_at' | 'updated_at'>): Promise<ExerciseSet | null> => {
  console.log('Database: Attempting to save exercise set:', setData)
  
  try {
    const { data, error } = await supabase
      .from('exercise_sets')
      .insert([setData])
      .select()
      .single()
    
    if (error) {
      console.error('Error saving exercise set:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return null
    }
    
    console.log('Database: Successfully saved exercise set:', data)
    return data
  } catch (err) {
    console.error('Unexpected error saving exercise set:', err)
    return null
  }
}

export const getExerciseSets = async (userId: string, date?: string): Promise<ExerciseSet[]> => {
  let query = supabase
    .from('exercise_sets')
    .select(`
      *,
      workout_sessions!inner (
        workout_date
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (date) {
    query = query.eq('workout_sessions.workout_date', date)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching exercise sets:', error)
    return []
  }
  
  return data || []
}

export const updateExerciseSet = async (setId: string, updates: Partial<ExerciseSet>): Promise<ExerciseSet | null> => {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating exercise set:', error)
    return null
  }
  
  return data
}

export const deleteExerciseSet = async (setId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('exercise_sets')
    .delete()
    .eq('id', setId)
  
  if (error) {
    console.error('Error deleting exercise set:', error)
    return false
  }
  
  return true
}

// =====================================================
// USER WEIGHT OPERATIONS
// =====================================================

export interface UserWeight {
  id: string
  user_id: string
  weight_kg: number
  recorded_date: string
  body_fat_percentage?: number
  muscle_mass_kg?: number
  notes?: string
  created_at: string
}

export const saveUserWeight = async (weightData: Omit<UserWeight, 'id' | 'created_at'>): Promise<UserWeight | null> => {
  const { data, error } = await supabase
    .from('user_weights')
    .upsert([weightData], { onConflict: 'user_id,recorded_date' })
    .select()
    .single()
  
  if (error) {
    console.error('Error saving user weight:', error)
    return null
  }
  
  return data
}

export const getUserWeights = async (userId: string): Promise<UserWeight[]> => {
  const { data, error } = await supabase
    .from('user_weights')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_date', { ascending: false })
  
  if (error) {
    console.error('Error fetching user weights:', error)
    return []
  }
  
  return data || []
}

// =====================================================
// EXERCISE PROGRESS OPERATIONS
// =====================================================

export interface ExerciseProgress {
  id: string
  user_id: string
  exercise_id?: string
  exercise_name: string
  max_weight_kg: number
  max_reps: number
  total_volume_kg: number
  total_sessions: number
  last_performed_date?: string
  personal_best_date?: string
  created_at: string
  updated_at: string
}

export const getExerciseProgress = async (userId: string, exerciseName?: string): Promise<ExerciseProgress[]> => {
  let query = supabase
    .from('exercise_progress')
    .select('*')
    .eq('user_id', userId)
    .order('total_volume_kg', { ascending: false })
  
  if (exerciseName) {
    query = query.eq('exercise_name', exerciseName)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching exercise progress:', error)
    return []
  }
  
  return data || []
}

// =====================================================
// ANALYTICS AND REPORTING
// =====================================================

export interface WorkoutAnalytics {
  totalWorkouts: number
  totalSets: number
  totalReps: number
  totalVolume: number
  avgWorkoutDuration: number
  lastWorkoutDate: string
  bodyPartsWorked: string[]
}

export const getUserAnalytics = async (userId: string, startDate?: string, endDate?: string): Promise<WorkoutAnalytics | null> => {
  try {
    // Get workout sessions in date range
    let sessionQuery = supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
    
    if (startDate) sessionQuery = sessionQuery.gte('workout_date', startDate)
    if (endDate) sessionQuery = sessionQuery.lte('workout_date', endDate)
    
    const { data: sessions, error: sessionError } = await sessionQuery
    
    if (sessionError) throw sessionError
    
    // Get exercise sets in date range
    let setsQuery = supabase
      .from('exercise_sets')
      .select(`
        *,
        workout_sessions!inner (
          workout_date
        )
      `)
      .eq('user_id', userId)
    
    if (startDate) setsQuery = setsQuery.gte('workout_sessions.workout_date', startDate)
    if (endDate) setsQuery = setsQuery.lte('workout_sessions.workout_date', endDate)
    
    const { data: sets, error: setsError } = await setsQuery
    
    if (setsError) throw setsError
    
    // Calculate analytics
    const totalWorkouts = sessions?.length || 0
    const totalSets = sets?.length || 0
    const totalReps = sets?.reduce((sum, set) => sum + set.reps, 0) || 0
    const totalVolume = sets?.reduce((sum, set) => sum + (set.reps * set.weight_kg), 0) || 0
    const avgWorkoutDuration = sessions?.length ? 
      sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) / sessions.length : 0
    const lastWorkoutDate = sessions?.[0]?.workout_date || ''
    const bodyPartsWorked = [...new Set(sets?.map(set => set.body_part) || [])]
    
    return {
      totalWorkouts,
      totalSets,
      totalReps,
      totalVolume,
      avgWorkoutDuration,
      lastWorkoutDate,
      bodyPartsWorked
    }
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return null
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export const generateVideoLink = (exerciseName: string): string => {
  const searchQuery = encodeURIComponent(`${exerciseName} exercise tutorial`)
  return `https://www.google.com/search?q=${searchQuery}&tbm=vid`
}

export const getCurrentUser = async (): Promise<User | null> => {
  // This would typically use Supabase Auth
  // For now, we'll use a simple localStorage-based approach
  if (typeof window === 'undefined') return null
  
  const username = localStorage.getItem('current_user')
  if (!username) return null
  
  return await getUser(username)
}

export const setCurrentUser = (username: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('current_user', username)
}

export const logout = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('current_user')
}

// =====================================================
// DATABASE HEALTH CHECK
// =====================================================

export const checkDatabaseHealth = async (): Promise<{
  isHealthy: boolean
  missingTables: string[]
  errors: string[]
}> => {
  const requiredTables = [
    'users',
    'workout_sessions',
    'exercise_sets',
    'exercises',
    'exercise_categories',
    'user_weights'
  ]
  
  const missingTables: string[] = []
  const errors: string[] = []
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (error) {
        if (error.code === '42P01') { // Table does not exist
          missingTables.push(table)
        } else {
          errors.push(`${table}: ${error.message}`)
        }
      }
    } catch (err) {
      errors.push(`${table}: ${err}`)
    }
  }
  
  return {
    isHealthy: missingTables.length === 0 && errors.length === 0,
    missingTables,
    errors
  }
}