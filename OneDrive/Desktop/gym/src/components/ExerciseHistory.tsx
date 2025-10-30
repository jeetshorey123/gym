'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Edit3, Trash2, Eye, Clock, Target, Weight, Zap, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  getCurrentUser,
  getWorkoutSessions,
  getExerciseSets,
  deleteExerciseSet,
  updateExerciseSet,
  updateWorkoutSession,
  deleteWorkoutSession,
  type WorkoutSession,
  type ExerciseSet,
  type User
} from '../lib/supabase/database'

interface WorkoutWithSets extends WorkoutSession {
  exercise_sets: ExerciseSet[]
}

type ViewMode = 'calendar' | 'list'

export default function ExerciseHistory() {
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithSets | null>(null)
  const [editingSet, setEditingSet] = useState<{ id: string; reps: number; weight: number } | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  useEffect(() => {
    const loadUserAndHistory = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
      if (user) {
        await loadWorkoutHistory(user.id)
      }
      setLoading(false)
    }
    loadUserAndHistory()
  }, [])

  const loadWorkoutHistory = async (userId: string) => {
    try {
      setLoading(true)
      const sessions = await getWorkoutSessions(userId)
      
      const workoutsWithSets: WorkoutWithSets[] = []
      
      for (const session of sessions) {
        const sets = await getExerciseSets(userId, session.workout_date)
        const sessionSets = sets.filter(set => set.workout_session_id === session.id)
        
        workoutsWithSets.push({
          ...session,
          exercise_sets: sessionSets
        })
      }
      
      setWorkouts(workoutsWithSets)
    } catch (error) {
      console.error('Error loading workout history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWorkout = async (workoutId: string, workoutName: string) => {
    if (!confirm(`Are you sure you want to delete the entire workout "${workoutName}"? This will delete all exercise sets in this workout and cannot be undone.`)) return

    const success = await deleteWorkoutSession(workoutId)
    if (success && currentUser) {
      await loadWorkoutHistory(currentUser.id)
      if (selectedWorkout?.id === workoutId) {
        setSelectedWorkout(null)
      }
    }
  }

  const handleDeleteSet = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this exercise set?')) return

    const success = await deleteExerciseSet(setId)
    if (success && currentUser) {
      await loadWorkoutHistory(currentUser.id)
      if (selectedWorkout) {
        const updatedSets = selectedWorkout.exercise_sets.filter(set => set.id !== setId)
        setSelectedWorkout({
          ...selectedWorkout,
          exercise_sets: updatedSets
        })
      }
    }
  }

  const handleEditSet = (set: ExerciseSet) => {
    setEditingSet({
      id: set.id,
      reps: set.reps,
      weight: set.weight_kg
    })
  }

  const handleSaveEdit = async () => {
    if (!editingSet || !currentUser) return

    const updates = {
      reps: editingSet.reps,
      weight_kg: editingSet.weight
    }

    const success = await updateExerciseSet(editingSet.id, updates)
    if (success) {
      await loadWorkoutHistory(currentUser.id)
      if (selectedWorkout) {
        const updatedSets = selectedWorkout.exercise_sets.map(set =>
          set.id === editingSet.id ? { ...set, ...updates } : set
        )
        setSelectedWorkout({
          ...selectedWorkout,
          exercise_sets: updatedSets
        })
      }
      setEditingSet(null)
    }
  }

  // Calendar helper functions
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    const days: Date[] = []
    
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day))
    }
    
    return days
  }

  const getWorkoutsForDate = (date: Date): WorkoutWithSets[] => {
    const dateStr = date.toISOString().split('T')[0]
    return workouts.filter(workout => 
      new Date(workout.workout_date).toISOString().split('T')[0] === dateStr
    )
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSameMonth = (date: Date, month: Date): boolean => {
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to view exercise history</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading workout history...</p>
      </div>
    )
  }

  const displayWorkouts = viewMode === 'calendar' && selectedDate 
    ? getWorkoutsForDate(selectedDate)
    : workouts

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Exercise History</h2>
          <p className="text-gray-600">Track your workout progress over time</p>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            List
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Calendar Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => {
                const workoutsForDay = getWorkoutsForDate(date)
                const isCurrentMonth = isSameMonth(date, currentMonth)
                const todayClass = isToday(date) ? 'bg-blue-100 border-blue-300' : ''
                
                return (
                  <div
                    key={index}
                    className={`
                      relative min-h-[80px] p-1 border rounded-md cursor-pointer transition-colors
                      ${isCurrentMonth ? 'hover:bg-gray-50' : 'text-gray-400'}
                      ${todayClass}
                    `}
                    onClick={() => {
                      setSelectedDate(date)
                      if (workoutsForDay.length > 0) {
                        setSelectedWorkout(workoutsForDay[0])
                      }
                    }}
                  >
                    <div className="text-sm font-medium">{date.getDate()}</div>
                    
                    {workoutsForDay.length > 0 && isCurrentMonth && (
                      <div className="mt-1 space-y-1">
                        {workoutsForDay.slice(0, 2).map((workout, idx) => (
                          <div
                            key={workout.id}
                            className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded truncate"
                            title={workout.session_name || `${workout.total_sets} sets`}
                          >
                            {workout.session_name || `${workout.total_sets} sets`}
                          </div>
                        ))}
                        {workoutsForDay.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{workoutsForDay.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Header for Calendar View */}
      {viewMode === 'calendar' && selectedDate && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Workouts for {selectedDate.toLocaleDateString()}
          </h3>
        </div>
      )}

      {/* Workout List */}
      {displayWorkouts.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {viewMode === 'calendar' && selectedDate 
              ? 'No workouts on this date' 
              : 'No workout history yet'
            }
          </h3>
          <p className="text-gray-500">
            {viewMode === 'calendar' && selectedDate 
              ? 'Select a different date to view workouts' 
              : 'Complete your first workout to see it here'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {workout.session_name || `Workout - ${workout.workout_date}`}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(workout.workout_date).toLocaleDateString()}
                  </p>
                  {workout.is_completed && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                      Completed
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="View details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorkout(workout.id, workout.session_name || 'Unnamed Workout')}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete entire workout"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Workout Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{workout.total_sets}</div>
                  <div className="text-sm text-gray-600">Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{workout.total_reps}</div>
                  <div className="text-sm text-gray-600">Reps</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{workout.total_volume_kg}kg</div>
                  <div className="text-sm text-gray-600">Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">
                    {formatDuration(workout.duration_minutes)}
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
              </div>

              {/* Exercise Sets Details */}
              {selectedWorkout?.id === workout.id && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">Exercise Sets ({workout.exercise_sets.length})</h4>
                  {workout.exercise_sets.length === 0 ? (
                    <p className="text-gray-500 text-sm">No exercise sets recorded</p>
                  ) : (
                    <div className="space-y-3">
                      {workout.exercise_sets.map((set) => (
                        <div
                          key={set.id}
                          className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{set.exercise_name}</div>
                            <div className="text-sm text-gray-600 capitalize">
                              {set.body_part} • Set {set.set_number}
                            </div>
                            
                            {editingSet?.id === set.id ? (
                              <div className="mt-2 flex gap-2 items-center">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editingSet.reps}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '' || /^\d+$/.test(value)) {
                                      setEditingSet(prev => prev ? { ...prev, reps: parseInt(value) || 0 } : null)
                                    }
                                  }}
                                  className="w-16 px-2 py-1 border rounded text-sm"
                                  placeholder="Reps"
                                />
                                <span className="text-sm text-gray-500">reps ×</span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  pattern="[0-9]*\.?[0-9]*"
                                  value={editingSet.weight}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                      setEditingSet(prev => prev ? { ...prev, weight: parseFloat(value) || 0 } : null)
                                    }
                                  }}
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                  placeholder="Weight"
                                />
                                <span className="text-sm text-gray-500">kg</span>
                                <button
                                  onClick={handleSaveEdit}
                                  className="text-green-600 hover:text-green-800 p-1"
                                  title="Save changes"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingSet(null)}
                                  className="text-gray-600 hover:text-gray-800 p-1"
                                  title="Cancel editing"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="mt-1 space-y-1">
                                <div className="text-sm text-gray-700 flex gap-4">
                                  <span><strong>Reps:</strong> {set.reps}</span>
                                  <span><strong>Weight:</strong> {set.weight_kg}kg</span>
                                  <span className="text-gray-500">Volume: {(set.reps * set.weight_kg).toFixed(1)}kg</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {editingSet?.id !== set.id && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditSet(set)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit set"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSet(set.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete set"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}