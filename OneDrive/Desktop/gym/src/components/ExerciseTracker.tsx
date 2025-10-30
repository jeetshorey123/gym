'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ExternalLink, Save, X, Play, Check, ArrowLeft, Info } from 'lucide-react'
import { 
  getCurrentUser,
  saveExerciseSet,
  getExerciseSets,
  deleteExerciseSet,
  updateExerciseSet,
  createWorkoutSession,
  updateWorkoutSession,
  generateVideoLink,
  type ExerciseSet,
  type WorkoutSession,
  type User
} from '@/lib/supabase/database'
import { EXERCISE_DATABASE } from '@/lib/localStorage'

const BODY_PARTS = [
  'warmup', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'stretches'
]

interface WorkoutExercise {
  bodyPart: string
  exerciseName: string
  completed: boolean
  sets: { reps: number; weight: number; completed: boolean }[]
}

interface EditingExercise {
  id: string
  reps: number
  weight: number
}

export default function ExerciseTracker() {
  const [exercises, setExercises] = useState<ExerciseSet[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedBodyPart, setSelectedBodyPart] = useState('')
  const [selectedExercise, setSelectedExercise] = useState('')
  const [sets, setSets] = useState(1)
  const [reps, setReps] = useState(1)
  const [weight, setWeight] = useState(0)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  // Workout mode state
  const [workoutMode, setWorkoutMode] = useState<'select' | 'workout' | 'normal'>('normal')
  const [selectedWorkoutExercises, setSelectedWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentWorkoutSession, setCurrentWorkoutSession] = useState<WorkoutSession | null>(null)
  const [workoutStartTime, setWorkoutStartTime] = useState<string | null>(null)
  
  // Editing state
  const [editingExercise, setEditingExercise] = useState<EditingExercise | null>(null)

  useEffect(() => {
    const loadUserAndExercises = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
      if (user) {
        await loadExercises(user.id, selectedDate)
      }
    }
    loadUserAndExercises()
  }, [selectedDate])

  const loadExercises = async (userId: string, date: string) => {
    const exercisesForDate = await getExerciseSets(userId, date)
    setExercises(exercisesForDate)
  }

  const handleAddExercise = async () => {
    if (!currentUser || !selectedBodyPart || !selectedExercise) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Create or get current workout session
      let workoutSession = currentWorkoutSession
      if (!workoutSession) {
        workoutSession = await createWorkoutSession({
          user_id: currentUser.id,
          workout_date: selectedDate,
          session_name: `${selectedDate} Workout`,
          start_time: new Date().toISOString(),
          total_sets: 0,
          total_reps: 0,
          total_volume_kg: 0,
          is_completed: false
        })
        if (workoutSession) {
          setCurrentWorkoutSession(workoutSession)
        }
      }

      if (!workoutSession) {
        alert('Failed to create workout session')
        return
      }

      // Save each set as a separate exercise set
      for (let i = 0; i < sets; i++) {
        const exerciseSet = await saveExerciseSet({
          workout_session_id: workoutSession.id,
          user_id: currentUser.id,
          exercise_name: selectedExercise,
          body_part: selectedBodyPart,
          set_number: i + 1,
          reps: reps,
          weight_kg: weight,
          notes: ''
        })

        if (exerciseSet) {
          setExercises(prev => [...prev, exerciseSet])
        }
      }

      // Update workout session totals
      const totalSets = workoutSession.total_sets + sets
      const totalReps = workoutSession.total_reps + (sets * reps)
      const totalVolume = workoutSession.total_volume_kg + (sets * reps * weight)

      await updateWorkoutSession(workoutSession.id, {
        total_sets: totalSets,
        total_reps: totalReps,
        total_volume_kg: totalVolume
      })
      
      // Reset form
      setSelectedBodyPart('')
      setSelectedExercise('')
      setSets(1)
      setReps(1)
      setWeight(0)
    } catch (error) {
      console.error('Error adding exercise:', error)
      alert('Failed to add exercise')
    } finally {
      setLoading(false)
    }
  }

  const handleEditExercise = (exercise: ExerciseSet) => {
    setEditingExercise({
      id: exercise.id,
      reps: exercise.reps,
      weight: exercise.weight_kg
    })
  }

  const handleSaveEdit = async () => {
    if (!editingExercise) return

    const updates = await updateExerciseSet(editingExercise.id, {
      reps: editingExercise.reps,
      weight_kg: editingExercise.weight
    })

    if (updates) {
      setExercises(prev => prev.map(ex => 
        ex.id === editingExercise.id ? updates : ex
      ))
      setEditingExercise(null)
    }
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return

    const success = await deleteExerciseSet(exerciseId)
    if (success) {
      setExercises(prev => prev.filter(ex => ex.id !== exerciseId))
    }
  }

  // Workout mode functions
  const startWorkoutSelection = () => {
    setWorkoutMode('select')
    setSelectedWorkoutExercises([])
  }

  const addExerciseToWorkout = (bodyPart: string, exerciseName: string) => {
    const newExercise: WorkoutExercise = {
      bodyPart,
      exerciseName,
      completed: false,
      sets: [{ reps: 1, weight: 1, completed: false }]
    }
    setSelectedWorkoutExercises(prev => [...prev, newExercise])
  }

  const removeExerciseFromWorkout = (index: number) => {
    setSelectedWorkoutExercises(prev => prev.filter((_, i) => i !== index))
  }

  const startWorkout = async () => {
    if (!currentUser || selectedWorkoutExercises.length === 0) {
      alert('Please select at least one exercise')
      return
    }

    const startTime = new Date().toISOString()
    setWorkoutStartTime(startTime)

    // Create new workout session
    const workoutSession = await createWorkoutSession({
      user_id: currentUser.id,
      workout_date: selectedDate,
      session_name: `${selectedDate} Workout Session`,
      start_time: startTime,
      total_sets: 0,
      total_reps: 0,
      total_volume_kg: 0,
      is_completed: false
    })

    if (workoutSession) {
      setCurrentWorkoutSession(workoutSession)
      setWorkoutMode('workout')
      setCurrentExerciseIndex(0)
    }
  }

  const addSetToCurrentExercise = () => {
    setSelectedWorkoutExercises(prev => {
      const updated = [...prev]
      updated[currentExerciseIndex].sets.push({ reps: 1, weight: 1, completed: false })
      return updated
    })
  }

  const updateSet = (setIndex: number, field: 'reps' | 'weight', value: number) => {
    setSelectedWorkoutExercises(prev => {
      const updated = [...prev]
      updated[currentExerciseIndex].sets[setIndex][field] = value
      return updated
    })
  }

  const completeSet = (setIndex: number) => {
    const currentExercise = selectedWorkoutExercises[currentExerciseIndex]
    const set = currentExercise.sets[setIndex]
    
    // Validate that reps and weight are properly set
    if (set.reps <= 0) {
      alert('Please enter a valid number of reps (greater than 0)')
      return
    }
    
    if (set.weight <= 0) {
      alert('Please enter a valid weight (greater than 0)')
      return
    }
    
    setSelectedWorkoutExercises(prev => {
      const updated = [...prev]
      updated[currentExerciseIndex].sets[setIndex].completed = true
      return updated
    })
  }

  const completeExercise = async () => {
    if (!currentUser || !currentWorkoutSession) return

    const currentExercise = selectedWorkoutExercises[currentExerciseIndex]
    const completedSets = currentExercise.sets.filter(set => set.completed)
    
    if (completedSets.length === 0) {
      alert('Please complete at least one set')
      return
    }

    // Save each completed set to database
    for (let i = 0; i < completedSets.length; i++) {
      const set = completedSets[i]
      
      // Debug logging
      console.log('Saving exercise set:', {
        exercise_name: currentExercise.exerciseName,
        body_part: currentExercise.bodyPart,
        set_number: i + 1,
        reps: set.reps,
        weight_kg: set.weight,
        set_data: set
      })
      
      const exerciseSet = await saveExerciseSet({
        workout_session_id: currentWorkoutSession.id,
        user_id: currentUser.id,
        exercise_name: currentExercise.exerciseName,
        body_part: currentExercise.bodyPart,
        set_number: i + 1,
        reps: set.reps,
        weight_kg: set.weight,
        notes: ''
      })

      if (exerciseSet) {
        setExercises(prev => [...prev, exerciseSet])
      }
    }

    // Update workout session totals
    const totalNewSets = completedSets.length
    const totalNewReps = completedSets.reduce((sum, set) => sum + set.reps, 0)
    const totalNewVolume = completedSets.reduce((sum, set) => sum + (set.reps * set.weight), 0)

    await updateWorkoutSession(currentWorkoutSession.id, {
      total_sets: currentWorkoutSession.total_sets + totalNewSets,
      total_reps: currentWorkoutSession.total_reps + totalNewReps,
      total_volume_kg: currentWorkoutSession.total_volume_kg + totalNewVolume
    })

    // Mark exercise as completed
    setSelectedWorkoutExercises(prev => {
      const updated = [...prev]
      updated[currentExerciseIndex].completed = true
      return updated
    })

    // Move to next exercise if available
    if (currentExerciseIndex < selectedWorkoutExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
    } else {
      // All exercises completed, show success message but don't auto-finish
      alert('🎉 All exercises completed! You can now complete your workout or add more exercises.')
    }
  }

  const finishWorkout = async () => {
    if (!currentWorkoutSession) return

    try {
      // Update workout session as completed
      await updateWorkoutSession(currentWorkoutSession.id, {
        end_time: new Date().toISOString(),
        is_completed: true,
        duration_minutes: workoutStartTime ? 
          Math.round((new Date().getTime() - new Date(workoutStartTime).getTime()) / (1000 * 60)) : 
          undefined
      })

      alert('🎉 Workout completed successfully! Great job! 💪\n\nYou can view, edit, or delete this workout from the Exercise History section.')
      
      // Reset workout state
      setWorkoutMode('normal')
      setSelectedWorkoutExercises([])
      setCurrentExerciseIndex(0)
      setCurrentWorkoutSession(null)
      setWorkoutStartTime(null)
      
      // Refresh the exercises list to show updated data
      if (currentUser) {
        await loadExercises(currentUser.id, selectedDate)
      }
    } catch (error) {
      console.error('Error finishing workout:', error)
      alert('Failed to complete workout. Please try again.')
    }
  }

  const completeCurrentWorkout = async () => {
    if (!currentWorkoutSession) return

    const confirmComplete = confirm('Are you sure you want to complete this workout?\n\nAny incomplete exercises will be saved as they are. You can edit or delete this workout from the Exercise History section.')
    
    if (confirmComplete) {
      await finishWorkout()
    }
  }

  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
    }
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to track exercises</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Exercise Tracker</h2>
        <p className="text-gray-600">Track your workouts and build strength</p>
      </div>

      {/* Workout Mode Toggle */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setWorkoutMode('normal')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              workoutMode === 'normal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Quick Add
          </button>
          <button
            onClick={startWorkoutSelection}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              workoutMode !== 'normal'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Play className="w-4 h-4" />
            Start Workout
          </button>
        </div>
      </div>

      {/* Workout Selection Mode */}
      {workoutMode === 'select' && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Exercises for Your Workout</h3>
          
          {/* Exercise Selection Grid */}
          <div className="space-y-6">
            {BODY_PARTS.map((bodyPart) => (
              <div key={bodyPart} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 capitalize mb-3">{bodyPart}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {EXERCISE_DATABASE[bodyPart as keyof typeof EXERCISE_DATABASE]?.map((exercise) => (
                    <div
                      key={exercise}
                      className="flex items-center justify-between p-2 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <button
                        onClick={() => addExerciseToWorkout(bodyPart, exercise)}
                        disabled={selectedWorkoutExercises.some(ex => ex.exerciseName === exercise)}
                        className="flex-1 text-left disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        {exercise}
                      </button>
                      <button
                        onClick={() => window.open(generateVideoLink(exercise), '_blank')}
                        className="ml-2 p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        title={`Watch ${exercise} video tutorial`}
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Exercises */}
          {selectedWorkoutExercises.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Selected Exercises ({selectedWorkoutExercises.length})</h4>
              <div className="space-y-2">
                {selectedWorkoutExercises.map((exercise, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                    <span className="text-sm">
                      <span className="font-medium">{exercise.exerciseName}</span>
                      <span className="text-gray-500 ml-2 capitalize">({exercise.bodyPart})</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(generateVideoLink(exercise.exerciseName), '_blank')}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title={`Watch ${exercise.exerciseName} video tutorial`}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeExerciseFromWorkout(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={startWorkout}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Workout ({selectedWorkoutExercises.length} exercises)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Workout Mode */}
      {workoutMode === 'workout' && selectedWorkoutExercises.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={goToPreviousExercise}
              disabled={currentExerciseIndex === 0}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Exercise {currentExerciseIndex + 1} of {selectedWorkoutExercises.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentExerciseIndex + 1) / selectedWorkoutExercises.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={completeCurrentWorkout}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                title="Complete and save this workout"
              >
                <Check className="w-4 h-4" />
                Complete Workout
              </button>
              <button
                onClick={finishWorkout}
                className="text-red-600 hover:text-red-800 px-3 py-2"
                title="End workout without saving"
              >
                End
              </button>
            </div>
          </div>

          {(() => {
            const currentExercise = selectedWorkoutExercises[currentExerciseIndex]
            return (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">{currentExercise.exerciseName}</h3>
                  <p className="text-gray-600 capitalize">{currentExercise.bodyPart}</p>
                  <a
                    href={generateVideoLink(currentExercise.exerciseName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch Exercise Video
                  </a>
                </div>

                {/* Sets */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">Sets</h4>
                    <button
                      onClick={addSetToCurrentExercise}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Set
                    </button>
                  </div>

                  {currentExercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className={`border rounded-lg p-4 ${set.completed ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-800">Set {setIndex + 1}</span>
                        {set.completed && (
                          <span className="text-green-600 flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                      
                      {!set.completed && (
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="0"
                              value={set.reps || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                // Allow only numbers
                                if (value === '' || /^\d+$/.test(value)) {
                                  updateSet(setIndex, 'reps', value === '' ? 0 : parseInt(value))
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                /* Hide number input spinners */
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield'
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9]*\.?[0-9]*"
                              placeholder="0.0"
                              value={set.weight || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                // Allow only numbers and decimal point
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  updateSet(setIndex, 'weight', value === '' ? 0 : parseFloat(value))
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                /* Hide number input spinners */
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {!set.completed && set.reps > 0 && set.weight > 0 && (
                        <button
                          onClick={() => completeSet(setIndex)}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Complete Set
                        </button>
                      )}

                      {!set.completed && (set.reps <= 0 || set.weight <= 0) && (
                        <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center text-sm">
                          Enter reps and weight to complete set
                        </div>
                      )}

                      {set.completed && (
                        <div className="text-sm text-gray-600">
                          {set.reps} reps × {set.weight}kg
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Complete Exercise Button */}
                {currentExercise.sets.some(set => set.completed) && (
                  <div className="mt-6">
                    <button
                      onClick={completeExercise}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {currentExerciseIndex < selectedWorkoutExercises.length - 1 ? 'Next Exercise' : 'Finish Last Exercise'}
                    </button>
                  </div>
                )}

                {/* Complete Workout Button - Always Visible */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={completeCurrentWorkout}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-3 text-lg"
                  >
                    <Check className="w-6 h-6" />
                    Complete & Save Workout
                  </button>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Save your workout progress. You can edit or delete from Exercise History.
                  </p>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Normal Mode - Date Selection and Quick Add */}
      {workoutMode === 'normal' && (
        <>
          {/* Date Selection */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Exercise Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Add Exercise</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Body Part Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Part
                </label>
                <select
                  value={selectedBodyPart}
                  onChange={(e) => {
                    setSelectedBodyPart(e.target.value)
                    setSelectedExercise('')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select body part</option>
                  {BODY_PARTS.map((part) => (
                    <option key={part} value={part}>
                      {part.charAt(0).toUpperCase() + part.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exercise Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    disabled={!selectedBodyPart}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Select exercise</option>
                    {selectedBodyPart && EXERCISE_DATABASE[selectedBodyPart as keyof typeof EXERCISE_DATABASE]?.map((exercise) => (
                      <option key={exercise} value={exercise}>
                        {exercise}
                      </option>
                    ))}
                  </select>
                  {selectedExercise && (
                    <button
                      onClick={() => window.open(generateVideoLink(selectedExercise), '_blank')}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                      title={`Watch ${selectedExercise} video tutorial`}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sets
                </label>
                <input
                  type="number"
                  min="1"
                  value={sets}
                  onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Reps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reps
                </label>
                <input
                  type="number"
                  min="1"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Weight */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleAddExercise}
              disabled={loading || !selectedBodyPart || !selectedExercise}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add Exercise'}
            </button>
          </div>
        </>
      )}

      {/* Exercise List */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Exercises for {new Date(selectedDate).toLocaleDateString()}
        </h3>

        {exercises.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No exercises recorded for this date
          </p>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {exercise.exercise_name}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {exercise.body_part}
                    </p>
                    
                    {editingExercise?.id === exercise.id ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingExercise.reps}
                            onChange={(e) => setEditingExercise(prev => prev ? { ...prev, reps: parseInt(e.target.value) || 0 } : null)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            placeholder="Reps"
                          />
                          <input
                            type="number"
                            step="0.5"
                            value={editingExercise.weight}
                            onChange={(e) => setEditingExercise(prev => prev ? { ...prev, weight: parseFloat(e.target.value) || 0 } : null)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            placeholder="Weight"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800 p-1"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingExercise(null)}
                            className="text-gray-600 hover:text-gray-800 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex gap-4 text-sm text-gray-700">
                        <span>Set: {exercise.set_number}</span>
                        <span>Reps: {exercise.reps}</span>
                        <span>Weight: {exercise.weight_kg}kg</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditExercise(exercise)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit exercise"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <a
                      href={generateVideoLink(exercise.exercise_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Watch exercise video"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Today's Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {exercises.length}
            </div>
            <div className="text-sm text-gray-600">Exercise Sets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {[...new Set(exercises.map(ex => ex.exercise_name))].length}
            </div>
            <div className="text-sm text-gray-600">Unique Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {exercises.reduce((sum, ex) => sum + ex.reps, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Reps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {exercises.reduce((sum, ex) => sum + (ex.reps * ex.weight_kg), 0).toFixed(1)}kg
            </div>
            <div className="text-sm text-gray-600">Volume</div>
          </div>
        </div>
      </div>
    </div>
  )
}