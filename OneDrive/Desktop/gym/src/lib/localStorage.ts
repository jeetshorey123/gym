// Local Storage utility for development without Supabase
export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  user: string;
  date: string;
  bodyPart: string;
  name: string;
  exerciseName: string; // Keep for backward compatibility
  sets: ExerciseSet[];
  reps: number; // Keep for backward compatibility
  weight: number; // Keep for backward compatibility
  videoLink?: string;
}

export interface WeightEntry {
  id: string;
  user: string;
  date: string;
  weight: number;
}

export interface WorkoutDay {
  day: string;
  bodyParts: string[];
  exercises: string[];
}

export interface WorkoutSession {
  id: string;
  user: string;
  date: string;
  startTime: string;
  endTime: string;
  exercises: Exercise[];
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  duration: number; // in minutes
  isCompleted: boolean;
}

// Sample exercise data
export const EXERCISE_DATABASE = {
  // Warm-up exercises
  warmup: [
    'Arm Circles Forward',
    'Arm Circles Backward', 
    'Shoulder Shrugs',
    'Push-ups (Slow Controlled)',
    'Cat-Cow Stretch',
    'Band Pull-Aparts',
    'Torso Twists',
    'Jumping Jacks',
    'High Knees',
    'Bodyweight Squats',
    'Arm Swings',
    'Lunges in Place',
    'Hip Circles',
    'Glute Bridges',
    'Dynamic Leg Swings'
  ],
  
  // Chest exercises
  chest: [
    'Flat Bench Press (Barbell)',
    'Flat Bench Press (Dumbbell)',
    'Incline Bench Press',
    'Incline Dumbbell Press',
    'Decline Bench Press',
    'Dumbbell Fly',
    'Push-ups (Standard)',
    'Push-ups (Incline)',
    'Push-ups (Decline)',
    'Push-ups with Resistance Band',
    'Chest Press Machine',
    'Cable Crossover',
    'Pec Deck Machine',
    'Dumbbell Pullover'
  ],
  
  // Back exercises
  back: [
    'Pull-ups',
    'Chin-ups',
    'Assisted Pull-ups',
    'Bent-over Barbell Row',
    'Bent-over Dumbbell Row',
    'Single-Arm Dumbbell Row',
    'Lat Pulldown (Wide Grip)',
    'Lat Pulldown (Reverse Grip)',
    'Seated Cable Row',
    'Seated Cable Row (Neutral Grip)',
    'Seated Cable Row (Wide Grip)',
    'T-Bar Row',
    'Machine Assisted Row',
    'Straight-Arm Pulldown'
  ],
  
  // Shoulder exercises
  shoulders: [
    'Overhead Shoulder Press (Dumbbell)',
    'Overhead Barbell Press',
    'Dumbbell Arnold Press',
    'Lateral Raises (Dumbbell)',
    'Lateral Raises (Cable)',
    'Front Raises (Dumbbell)',
    'Front Raises (Cable)',
    'Front Raises (Plate)',
    'Reverse Fly (Rear Delts)',
    'Reverse Pec Deck',
    'Face Pulls',
    'Shrugs (Dumbbell)',
    'Shrugs (Barbell)'
  ],
  
  // Arms exercises
  arms: [
    // Biceps
    'Dumbbell Curls',
    'Hammer Curls',
    'Concentration Curls',
    'Barbell Curls',
    'EZ-Bar Curls',
    'Preacher Curls',
    'Cable Curls',
    'Incline Dumbbell Curls',
    
    // Triceps
    'Tricep Dips',
    'Overhead Dumbbell Triceps Extension',
    'Tricep Kickbacks',
    'Close-grip Bench Press',
    'Tricep Rope Pushdowns',
    'Overhead Rope Extension',
    'Skull Crushers (EZ-Bar)',
    'Skull Crushers (Dumbbell)',
    'Parallel Bar Dips'
  ],
  
  // Legs exercises
  legs: [
    'Barbell Back Squat',
    'Barbell Front Squat',
    'Dumbbell Squats',
    'Leg Press Machine',
    'Hack Squat Machine',
    'Walking Lunges',
    'Static Lunges (Weighted)',
    'Romanian Deadlifts',
    'Stiff-Leg Deadlifts',
    'Step-ups (Weighted)',
    'Calf Raises (Standing)',
    'Calf Raises (Seated)',
    'Leg Curl Machine',
    'Leg Extension Machine',
    'Bulgarian Split Squats'
  ],
  
  // Core exercises
  core: [
    'Plank',
    'Side Plank',
    'Russian Twists',
    'Russian Twists (Weighted)',
    'Leg Raises',
    'Hanging Leg Raises',
    'Bicycle Crunches',
    'Cable Woodchoppers',
    'Ab Crunch Machine',
    'Decline Sit-ups',
    'Stability Ball Rollouts',
    'Side Bends (Dumbbell)',
    'Side Bends (Plate)'
  ],
  
  // Glutes exercises
  glutes: [
    'Hip Thrusts (Barbell)',
    'Glute Bridges',
    'Glute Bridges (Weighted)',
    'Donkey Kicks',
    'Glute Kickbacks (Cable)',
    'Bulgarian Split Squats',
    'Side-lying Leg Raises',
    'Step-ups (Weighted)',
    'Smith Machine Squats',
    'Kettlebell Swings',
    'Abductor Machine'
  ],
  
  // Post-workout stretches
  stretches: [
    'Chest Stretch (Wall/Door Frame)',
    'Cross-body Shoulder Stretch',
    'Child\'s Pose',
    'Thread-the-Needle Stretch',
    'Standing Quad Stretch',
    'Hamstring Stretch (Seated)',
    'Hamstring Stretch (Lying)',
    'Triceps Stretch',
    'Side Stretch',
    'Cobra Stretch',
    'Seated Hamstring/Glute Stretch',
    'Figure-Four Stretch',
    'Biceps Wall Stretch',
    'Overhead Triceps Stretch',
    'Pigeon Pose'
  ]
};

// Local Storage Keys
const EXERCISES_KEY = 'gym_exercises';
const WEIGHTS_KEY = 'gym_weights';
const WORKOUTS_KEY = 'gym_workouts';
const WORKOUT_SESSIONS_KEY = 'gym_workout_sessions';

// Initialize default data if not exists
export const initializeLocalData = () => {
  if (typeof window === 'undefined') return;

  // Initialize exercises if not exists
  if (!localStorage.getItem(EXERCISES_KEY)) {
    localStorage.setItem(EXERCISES_KEY, JSON.stringify([]));
  }

  // Initialize weights if not exists
  if (!localStorage.getItem(WEIGHTS_KEY)) {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify([]));
  }

  // Initialize workouts if not exists
  if (!localStorage.getItem(WORKOUTS_KEY)) {
    const defaultWorkouts: WorkoutDay[] = [
      { day: 'Monday', bodyParts: ['chest', 'triceps'], exercises: [] },
      { day: 'Tuesday', bodyParts: ['back', 'biceps'], exercises: [] },
      { day: 'Wednesday', bodyParts: ['legs'], exercises: [] },
      { day: 'Thursday', bodyParts: ['shoulders'], exercises: [] },
      { day: 'Friday', bodyParts: ['chest', 'back'], exercises: [] },
      { day: 'Saturday', bodyParts: ['arms'], exercises: [] },
      { day: 'Sunday', bodyParts: ['rest'], exercises: [] }
    ];
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(defaultWorkouts));
  }
};

// Exercise CRUD operations
export const saveExercise = (exercise: Omit<Exercise, 'id'>): Exercise => {
  if (typeof window === 'undefined') throw new Error('localStorage not available');
  
  const exercises = getExercises();
  const newExercise: Exercise = {
    ...exercise,
    id: Date.now().toString(),
    name: exercise.name || exercise.exerciseName || '',
    exerciseName: exercise.exerciseName || exercise.name || '', // For backward compatibility
    sets: exercise.sets || [{ reps: exercise.reps || 0, weight: exercise.weight || 0 }],
    reps: exercise.reps || 0, // For backward compatibility
    weight: exercise.weight || 0 // For backward compatibility
  };
  
  exercises.push(newExercise);
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  
  return newExercise;
};

export const getExercises = (user?: string): Exercise[] => {
  if (typeof window === 'undefined') return [];
  
  const exercises = JSON.parse(localStorage.getItem(EXERCISES_KEY) || '[]');
  return user ? exercises.filter((ex: Exercise) => ex.user === user) : exercises;
};

export const getExercisesByDate = (user: string, date: string): Exercise[] => {
  return getExercises(user).filter(ex => ex.date === date);
};

export const getExercisesByBodyPart = (user: string, bodyPart: string): Exercise[] => {
  return getExercises(user).filter(ex => ex.bodyPart === bodyPart);
};

export const updateExercise = (user: string, updatedExercise: Exercise): void => {
  if (typeof window === 'undefined') return;
  
  const exercises = getExercises();
  const exerciseIndex = exercises.findIndex(ex => ex.id === updatedExercise.id && ex.user === user);
  
  if (exerciseIndex !== -1) {
    exercises[exerciseIndex] = updatedExercise;
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  }
};

export const deleteExercise = (user: string, exerciseId: string): void => {
  if (typeof window === 'undefined') return;
  
  const exercises = getExercises();
  const filteredExercises = exercises.filter(ex => !(ex.id === exerciseId && ex.user === user));
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(filteredExercises));
};

// Weight CRUD operations
export const saveWeight = (weight: Omit<WeightEntry, 'id'>): WeightEntry => {
  if (typeof window === 'undefined') throw new Error('localStorage not available');
  
  const weights = getWeights();
  const newWeight: WeightEntry = {
    ...weight,
    id: Date.now().toString()
  };
  
  weights.push(newWeight);
  localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
  
  return newWeight;
};

export const getWeights = (user?: string): WeightEntry[] => {
  if (typeof window === 'undefined') return [];
  
  const weights = JSON.parse(localStorage.getItem(WEIGHTS_KEY) || '[]');
  return user ? weights.filter((w: WeightEntry) => w.user === user) : weights;
};

export const deleteWeight = (id: string): void => {
  if (typeof window === 'undefined') return;
  
  const weights = getWeights();
  const filteredWeights = weights.filter(w => w.id !== id);
  localStorage.setItem(WEIGHTS_KEY, JSON.stringify(filteredWeights));
};

// Workout schedule operations
export const getWorkoutSchedule = (): WorkoutDay[] => {
  if (typeof window === 'undefined') return [];
  
  return JSON.parse(localStorage.getItem(WORKOUTS_KEY) || '[]');
};

export const updateWorkoutSchedule = (schedule: WorkoutDay[]): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(schedule));
};

// Utility functions
export const generateVideoLink = (exerciseName: string): string => {
  const searchQuery = encodeURIComponent(`${exerciseName} exercise tutorial`);
  return `https://www.google.com/search?q=${searchQuery}&tbm=vid`;
};

export const getCurrentUser = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('current_user');
};

export const setCurrentUser = (user: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('current_user', user);
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('current_user');
};

// Workout Session CRUD operations
export const saveWorkoutSession = (session: Omit<WorkoutSession, 'id'>): WorkoutSession => {
  if (typeof window === 'undefined') throw new Error('localStorage not available');
  
  const sessions = getWorkoutSessions();
  const newSession: WorkoutSession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  sessions.push(newSession);
  localStorage.setItem(WORKOUT_SESSIONS_KEY, JSON.stringify(sessions));
  
  return newSession;
};

export const getWorkoutSessions = (user?: string): WorkoutSession[] => {
  if (typeof window === 'undefined') return [];
  
  const sessions = JSON.parse(localStorage.getItem(WORKOUT_SESSIONS_KEY) || '[]');
  return user ? sessions.filter((session: WorkoutSession) => session.user === user) : sessions;
};

export const getWorkoutSessionsByDate = (user: string, date: string): WorkoutSession[] => {
  return getWorkoutSessions(user).filter(session => session.date === date);
};

export const updateWorkoutSession = (user: string, updatedSession: WorkoutSession): void => {
  if (typeof window === 'undefined') return;
  
  const sessions = getWorkoutSessions();
  const sessionIndex = sessions.findIndex(session => session.id === updatedSession.id && session.user === user);
  
  if (sessionIndex !== -1) {
    sessions[sessionIndex] = updatedSession;
    localStorage.setItem(WORKOUT_SESSIONS_KEY, JSON.stringify(sessions));
  }
};

export const deleteWorkoutSession = (user: string, sessionId: string): void => {
  if (typeof window === 'undefined') return;
  
  const sessions = getWorkoutSessions();
  const filteredSessions = sessions.filter(session => !(session.id === sessionId && session.user === user));
  localStorage.setItem(WORKOUT_SESSIONS_KEY, JSON.stringify(filteredSessions));
};