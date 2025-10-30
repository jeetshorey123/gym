'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, Calendar, Activity, BarChart3, Edit2, Trash2, Save, X, PieChart, Download, User } from 'lucide-react'
import * as XLSX from 'xlsx'
import { 
  getCurrentUser, 
  getExercises, 
  getWeights,
  updateExercise,
  deleteExercise,
  getExercisesByBodyPart,
  type Exercise,
  type WeightEntry 
} from '@/lib/localStorage'

interface EditingExercise {
  id: string;
  setIndex: number;
  field: 'reps' | 'weight';
  value: string;
}

export default function ProgressChart() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')
  const [viewMode, setViewMode] = useState<'overview' | 'bodypart' | 'exercise' | 'timeline' | 'body3d'>('overview')
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('chest')
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [editingExercise, setEditingExercise] = useState<EditingExercise | null>(null)
  const [bodyPartFilter, setBodyPartFilter] = useState<string>('all')

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    if (user) {
      loadData(user)
    }
  }, [])

  const loadData = (user: string) => {
    const userExercises = getExercises(user)
    const userWeights = getWeights(user)
    
    setExercises(userExercises)
    setWeights(userWeights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  // Date filtering functions
  const getFilteredExercises = () => {
    const now = new Date()
    const cutoffDate = new Date()
    
    let timeFilteredExercises = exercises
    
    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7)
      timeFilteredExercises = exercises.filter(ex => new Date(ex.date) >= cutoffDate)
    } else if (timeRange === 'month') {
      cutoffDate.setDate(now.getDate() - 30)
      timeFilteredExercises = exercises.filter(ex => new Date(ex.date) >= cutoffDate)
    }
    
    // Apply bodypart filter
    if (bodyPartFilter === 'all') {
      return timeFilteredExercises
    } else {
      return timeFilteredExercises.filter(ex => ex.bodyPart === bodyPartFilter)
    }
  }

  // Group exercises by time period
  const groupByTimePeriod = (exercises: Exercise[]) => {
    const grouped: { [key: string]: Exercise[] } = {}
    
    exercises.forEach(exercise => {
      const date = new Date(exercise.date)
      let key = ''
      
      if (timeRange === 'week') {
        key = date.toLocaleDateString()
      } else {
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        key = startOfWeek.toLocaleDateString()
      }
      
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(exercise)
    })
    
    return grouped
  }

  const handleEditStart = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', currentValue: number) => {
    setEditingExercise({
      id: exerciseId,
      setIndex,
      field,
      value: currentValue.toString()
    })
  }

  const handleEditSave = () => {
    if (!editingExercise || !currentUser) return
    
    const exercise = exercises.find(ex => ex.id === editingExercise.id)
    if (!exercise) return

    const newValue = parseFloat(editingExercise.value) || 0
    
    let updatedSets
    if (Array.isArray(exercise.sets)) {
      updatedSets = [...exercise.sets]
      updatedSets[editingExercise.setIndex] = {
        ...updatedSets[editingExercise.setIndex],
        [editingExercise.field]: newValue
      }
    } else {
      updatedSets = [{ 
        reps: exercise.reps || 0, 
        weight: exercise.weight || 0 
      }]
      updatedSets[editingExercise.setIndex] = {
        ...updatedSets[editingExercise.setIndex],
        [editingExercise.field]: newValue
      }
    }

    const updatedExercise = {
      ...exercise,
      sets: updatedSets,
      reps: editingExercise.field === 'reps' && editingExercise.setIndex === 0 ? newValue : exercise.reps,
      weight: editingExercise.field === 'weight' && editingExercise.setIndex === 0 ? newValue : exercise.weight
    }

    updateExercise(currentUser, updatedExercise)
    setEditingExercise(null)
    loadData(currentUser)
  }

  const handleEditCancel = () => {
    setEditingExercise(null)
  }

  const handleDeleteExercise = (exerciseId: string) => {
    if (!currentUser) return
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      deleteExercise(currentUser, exerciseId)
      loadData(currentUser)
    }
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to view progress</p>
      </div>
    )
  }

  const filteredExercises = getFilteredExercises()

  // Calculate stats
  const totalWorkouts = [...new Set(filteredExercises.map(ex => ex.date))].length
  const totalExercises = filteredExercises.length
  const bodyPartsWorked = [...new Set(filteredExercises.map(ex => ex.bodyPart))].length
  const totalVolume = filteredExercises.reduce((sum, ex) => {
    const sets = Array.isArray(ex.sets) ? ex.sets.length : ex.sets;
    return sum + (sets * ex.weight);
  }, 0)

  // Weight progress
  const latestWeight = weights[0]?.weight || 0
  const earliestWeight = weights[weights.length - 1]?.weight || latestWeight
  const weightChange = latestWeight - earliestWeight

  // Body part analysis
  const bodyPartStats = ['warmup', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'stretches'].map(bodyPart => {
    const bodyPartExercises = filteredExercises.filter(ex => ex.bodyPart === bodyPart)
    const totalSets = bodyPartExercises.reduce((sum, ex) => {
      return sum + (Array.isArray(ex.sets) ? ex.sets.length : ex.sets);
    }, 0)
    const totalVolume = bodyPartExercises.reduce((sum, ex) => {
      const sets = Array.isArray(ex.sets) ? ex.sets.length : ex.sets;
      return sum + (sets * ex.weight);
    }, 0)
    
    return {
      bodyPart,
      exercises: bodyPartExercises.length,
      sets: totalSets,
      volume: totalVolume
    }
  }).filter(stat => stat.exercises > 0)

  // Exercise progress analysis
  const uniqueExercises = [...new Set(filteredExercises.map(ex => ex.name || ex.exerciseName))].filter(Boolean)
  
  const getExerciseProgress = (exerciseName: string) => {
    const exerciseData = filteredExercises
      .filter(ex => (ex.name || ex.exerciseName) === exerciseName)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return exerciseData.map(ex => ({
      date: ex.date,
      maxWeight: Array.isArray(ex.sets) 
        ? Math.max(...ex.sets.map(set => set.weight))
        : ex.weight,
      totalReps: Array.isArray(ex.sets)
        ? ex.sets.reduce((sum, set) => sum + set.reps, 0)
        : ex.reps,
      volume: Array.isArray(ex.sets)
        ? ex.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0)
        : ex.reps * ex.weight
    }))
  }

  // Timeline analysis
  const timelineData = groupByTimePeriod(filteredExercises)

  // Daily progress data for bar chart
  const getDailyProgress = () => {
    const dailyData: { [key: string]: { volume: number, exercises: number, sets: number } } = {}
    const last7Days = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      last7Days.push(dateStr)
      dailyData[dateStr] = { volume: 0, exercises: 0, sets: 0 }
    }

    filteredExercises.forEach(exercise => {
      const exerciseDate = new Date(exercise.date).toISOString().split('T')[0]
      if (dailyData[exerciseDate]) {
        const sets = Array.isArray(exercise.sets) ? exercise.sets.length : exercise.sets || 1
        const volume = Array.isArray(exercise.sets) 
          ? exercise.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0)
          : (exercise.reps || 0) * (exercise.weight || 0)
        
        dailyData[exerciseDate].volume += volume
        dailyData[exerciseDate].exercises += 1
        dailyData[exerciseDate].sets += sets
      }
    })

    return last7Days.map(date => ({
      date,
      displayDate: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      ...dailyData[date]
    }))
  }

  // Progress over time data for line chart
  const getProgressOverTime = () => {
    const now = new Date()
    const timePoints = []
    const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      timePoints.push(date.toISOString().split('T')[0])
    }

    return timePoints.map(date => {
      const dayExercises = exercises.filter(ex => 
        new Date(ex.date).toISOString().split('T')[0] === date
      )
      
      const totalVolume = dayExercises.reduce((sum, ex) => {
        const volume = Array.isArray(ex.sets) 
          ? ex.sets.reduce((setSum, set) => setSum + (set.reps * set.weight), 0)
          : (ex.reps || 0) * (ex.weight || 0)
        return sum + volume
      }, 0)

      const avgWeight = weights.find(w => 
        new Date(w.date).toISOString().split('T')[0] === date
      )?.weight || null

      return {
        date,
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: totalVolume,
        exercises: dayExercises.length,
        weight: avgWeight
      }
    })
  }

  const dailyProgress = getDailyProgress()
  const progressOverTime = getProgressOverTime()

  // Excel Export Functions
  const exportExercisesToExcel = () => {
    if (!currentUser) return

    // Prepare exercise data for Excel
    const exerciseData = filteredExercises.map(exercise => {
      const sets = Array.isArray(exercise.sets) ? exercise.sets : [{ reps: exercise.reps || 0, weight: exercise.weight || 0 }]
      
      return sets.map((set, index) => ({
        'Date': new Date(exercise.date).toLocaleDateString(),
        'Exercise Name': exercise.name || exercise.exerciseName,
        'Body Part': exercise.bodyPart,
        'Set Number': index + 1,
        'Reps': set.reps,
        'Weight (kg)': set.weight,
        'Volume (kg)': set.reps * set.weight,
        'Day of Week': new Date(exercise.date).toLocaleDateString('en-US', { weekday: 'long' }),
        'Week': `Week ${Math.ceil((new Date().getTime() - new Date(exercise.date).getTime()) / (7 * 24 * 60 * 60 * 1000))}`
      }))
    }).flat()

    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Exercise Details Sheet
    const ws1 = XLSX.utils.json_to_sheet(exerciseData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Exercise Details')

    // Summary Sheet
    const summaryData = bodyPartStats.map(stat => ({
      'Body Part': stat.bodyPart,
      'Total Exercises': stat.exercises,
      'Total Sets': stat.sets,
      'Total Volume (kg)': stat.volume.toFixed(2),
      'Average Volume per Exercise': (stat.volume / stat.exercises).toFixed(2)
    }))
    const ws2 = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Body Part Summary')

    // Exercise Progress Sheet
    const exerciseProgressData = uniqueExercises.map(exerciseName => {
      const progress = getExerciseProgress(exerciseName)
      return progress.map(p => ({
        'Exercise Name': exerciseName,
        'Date': new Date(p.date).toLocaleDateString(),
        'Max Weight (kg)': p.maxWeight,
        'Total Reps': p.totalReps,
        'Volume (kg)': p.volume
      }))
    }).flat()
    const ws3 = XLSX.utils.json_to_sheet(exerciseProgressData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Exercise Progress')

    // Daily Progress Sheet
    const dailyProgressData = dailyProgress.map(day => ({
      'Date': new Date(day.date).toLocaleDateString(),
      'Day': day.displayDate,
      'Total Volume (kg)': day.volume,
      'Exercise Count': day.exercises,
      'Total Sets': day.sets
    }))
    const ws4 = XLSX.utils.json_to_sheet(dailyProgressData)
    XLSX.utils.book_append_sheet(wb, ws4, 'Daily Progress')

    // Weight Progress Sheet (if available)
    if (weights.length > 0) {
      const weightProgressData = weights.map(weight => ({
        'Date': new Date(weight.date).toLocaleDateString(),
        'Weight (kg)': weight.weight,
        'Change from Previous': weights.indexOf(weight) === weights.length - 1 ? 0 : 
          (weight.weight - weights[weights.indexOf(weight) + 1].weight).toFixed(2)
      }))
      const ws5 = XLSX.utils.json_to_sheet(weightProgressData)
      XLSX.utils.book_append_sheet(wb, ws5, 'Weight Progress')
    }

    // Download the file
    const fileName = `gym_data_${currentUser}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const exportChartsToExcel = () => {
    if (!currentUser) return

    const wb = XLSX.utils.book_new()

    // Volume Over Time Chart Data
    const volumeChartData = progressOverTime.map(point => ({
      'Date': new Date(point.date).toLocaleDateString(),
      'Display Date': point.displayDate,
      'Total Volume (kg)': point.volume,
      'Exercise Count': point.exercises
    }))
    const ws1 = XLSX.utils.json_to_sheet(volumeChartData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Volume Over Time')

    // Daily Bar Chart Data
    const dailyChartData = dailyProgress.map(day => ({
      'Date': new Date(day.date).toLocaleDateString(),
      'Day': day.displayDate,
      'Volume (kg)': day.volume,
      'Exercises': day.exercises,
      'Sets': day.sets
    }))
    const ws2 = XLSX.utils.json_to_sheet(dailyChartData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Daily Bar Chart')

    // Body Part Distribution
    const bodyPartChartData = bodyPartStats.map(stat => ({
      'Body Part': stat.bodyPart,
      'Exercise Count': stat.exercises,
      'Total Sets': stat.sets,
      'Volume (kg)': stat.volume,
      'Percentage of Total Volume': ((stat.volume / totalVolume) * 100).toFixed(2) + '%'
    }))
    const ws3 = XLSX.utils.json_to_sheet(bodyPartChartData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Body Part Distribution')

    // Weight Progress Chart Data (if available)
    if (weights.length > 0) {
      const sortedWeights = weights.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const weightChartData = sortedWeights.map((weight, index) => ({
        'Date': new Date(weight.date).toLocaleDateString(),
        'Weight (kg)': weight.weight,
        'Change from Start': index === 0 ? 0 : (weight.weight - sortedWeights[0].weight).toFixed(2),
        'Trend': index === 0 ? 'Baseline' : 
          weight.weight > sortedWeights[index - 1].weight ? 'Increasing' : 
          weight.weight < sortedWeights[index - 1].weight ? 'Decreasing' : 'Stable'
      }))
      const ws4 = XLSX.utils.json_to_sheet(weightChartData)
      XLSX.utils.book_append_sheet(wb, ws4, 'Weight Chart Data')
    }

    // Exercise Trends
    const exerciseTrendsData = uniqueExercises.map(exerciseName => {
      const progress = getExerciseProgress(exerciseName)
      if (progress.length < 2) return null
      
      const firstSession = progress[0]
      const lastSession = progress[progress.length - 1]
      const weightIncrease = lastSession.maxWeight - firstSession.maxWeight
      const volumeIncrease = lastSession.volume - firstSession.volume
      
      return {
        'Exercise Name': exerciseName,
        'First Session Date': new Date(firstSession.date).toLocaleDateString(),
        'Last Session Date': new Date(lastSession.date).toLocaleDateString(),
        'Sessions Count': progress.length,
        'Weight Increase (kg)': weightIncrease.toFixed(2),
        'Volume Increase (kg)': volumeIncrease.toFixed(2),
        'Average Weight per Session': (progress.reduce((sum, p) => sum + p.maxWeight, 0) / progress.length).toFixed(2),
        'Improvement Rate': weightIncrease > 0 ? 'Improving' : weightIncrease < 0 ? 'Declining' : 'Stable'
      }
    }).filter(Boolean)
    
    const ws5 = XLSX.utils.json_to_sheet(exerciseTrendsData)
    XLSX.utils.book_append_sheet(wb, ws5, 'Exercise Trends')

    // Download the file
    const fileName = `gym_charts_${currentUser}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const exportAllToExcel = () => {
    if (!currentUser) return

    const wb = XLSX.utils.book_new()

    // 1. Complete Exercise Log
    const exerciseData = filteredExercises.map(exercise => {
      const sets = Array.isArray(exercise.sets) ? exercise.sets : [{ reps: exercise.reps || 0, weight: exercise.weight || 0 }]
      
      return sets.map((set, index) => ({
        'Date': new Date(exercise.date).toLocaleDateString(),
        'Exercise Name': exercise.name || exercise.exerciseName,
        'Body Part': exercise.bodyPart,
        'Set Number': index + 1,
        'Reps': set.reps,
        'Weight (kg)': set.weight,
        'Volume (kg)': set.reps * set.weight,
        'Day of Week': new Date(exercise.date).toLocaleDateString('en-US', { weekday: 'long' }),
        'Week Number': Math.ceil((new Date().getTime() - new Date(exercise.date).getTime()) / (7 * 24 * 60 * 60 * 1000)),
        'Month': new Date(exercise.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }))
    }).flat()
    const ws1 = XLSX.utils.json_to_sheet(exerciseData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Complete Exercise Log')

    // 2. Daily Progress Summary
    const dailyProgressData = dailyProgress.map(day => ({
      'Date': new Date(day.date).toLocaleDateString(),
      'Day': day.displayDate,
      'Total Volume (kg)': day.volume,
      'Exercise Count': day.exercises,
      'Total Sets': day.sets,
      'Average Volume per Exercise': day.exercises > 0 ? (day.volume / day.exercises).toFixed(2) : 0,
      'Average Volume per Set': day.sets > 0 ? (day.volume / day.sets).toFixed(2) : 0
    }))
    const ws2 = XLSX.utils.json_to_sheet(dailyProgressData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Daily Progress')

    // 3. Body Part Analysis
    const bodyPartData = bodyPartStats.map(stat => ({
      'Body Part': stat.bodyPart,
      'Total Exercises': stat.exercises,
      'Total Sets': stat.sets,
      'Total Volume (kg)': stat.volume.toFixed(2),
      'Average Volume per Exercise': (stat.volume / stat.exercises).toFixed(2),
      'Average Volume per Set': (stat.volume / stat.sets).toFixed(2),
      'Percentage of Total Volume': ((stat.volume / totalVolume) * 100).toFixed(2) + '%',
      'Sessions per Week': (stat.exercises / (progressOverTime.length / 7)).toFixed(1)
    }))
    const ws3 = XLSX.utils.json_to_sheet(bodyPartData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Body Part Analysis')

    // 4. Exercise Progress Tracking
    const exerciseProgressData = uniqueExercises.map(exerciseName => {
      const progress = getExerciseProgress(exerciseName)
      if (progress.length === 0) return null
      
      const firstSession = progress[0]
      const lastSession = progress[progress.length - 1]
      const weightIncrease = lastSession.maxWeight - firstSession.maxWeight
      const volumeIncrease = lastSession.volume - firstSession.volume
      const avgWeight = progress.reduce((sum, p) => sum + p.maxWeight, 0) / progress.length
      const avgVolume = progress.reduce((sum, p) => sum + p.volume, 0) / progress.length
      
      return {
        'Exercise Name': exerciseName,
        'First Session': new Date(firstSession.date).toLocaleDateString(),
        'Last Session': new Date(lastSession.date).toLocaleDateString(),
        'Total Sessions': progress.length,
        'Starting Weight (kg)': firstSession.maxWeight,
        'Current Weight (kg)': lastSession.maxWeight,
        'Weight Increase (kg)': weightIncrease.toFixed(2),
        'Weight Increase (%)': firstSession.maxWeight > 0 ? ((weightIncrease / firstSession.maxWeight) * 100).toFixed(1) + '%' : '0%',
        'Starting Volume (kg)': firstSession.volume,
        'Current Volume (kg)': lastSession.volume,
        'Volume Increase (kg)': volumeIncrease.toFixed(2),
        'Average Weight (kg)': avgWeight.toFixed(2),
        'Average Volume (kg)': avgVolume.toFixed(2),
        'Progress Trend': weightIncrease > 0 ? 'Improving' : weightIncrease < 0 ? 'Declining' : 'Stable',
        'Sessions per Week': (progress.length / (progressOverTime.length / 7)).toFixed(1)
      }
    }).filter(Boolean)
    const ws4 = XLSX.utils.json_to_sheet(exerciseProgressData)
    XLSX.utils.book_append_sheet(wb, ws4, 'Exercise Progress')

    // 5. Timeline Chart Data
    const timelineChartData = progressOverTime.map(point => ({
      'Date': new Date(point.date).toLocaleDateString(),
      'Display Date': point.displayDate,
      'Total Volume (kg)': point.volume,
      'Exercise Count': point.exercises,
      'Moving Average Volume (7 days)': (() => {
        const index = progressOverTime.indexOf(point)
        const start = Math.max(0, index - 3)
        const end = Math.min(progressOverTime.length, index + 4)
        const slice = progressOverTime.slice(start, end)
        const avg = slice.reduce((sum, p) => sum + p.volume, 0) / slice.length
        return avg.toFixed(2)
      })(),
      'Weekly Total': (() => {
        const date = new Date(point.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        const weeklyTotal = progressOverTime.filter(p => {
          const pDate = new Date(p.date)
          return pDate >= weekStart && pDate <= weekEnd
        }).reduce((sum, p) => sum + p.volume, 0)
        
        return weeklyTotal.toFixed(2)
      })()
    }))
    const ws5 = XLSX.utils.json_to_sheet(timelineChartData)
    XLSX.utils.book_append_sheet(wb, ws5, 'Progress Timeline')

    // 6. Weight Progress (if available)
    if (weights.length > 0) {
      const sortedWeights = weights.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const weightProgressData = sortedWeights.map((weight, index) => ({
        'Date': new Date(weight.date).toLocaleDateString(),
        'Weight (kg)': weight.weight,
        'Change from Previous (kg)': index === 0 ? 0 : (weight.weight - sortedWeights[index - 1].weight).toFixed(2),
        'Change from Start (kg)': (weight.weight - sortedWeights[0].weight).toFixed(2),
        'Change from Start (%)': ((weight.weight - sortedWeights[0].weight) / sortedWeights[0].weight * 100).toFixed(2) + '%',
        'Trend': index === 0 ? 'Baseline' : 
          weight.weight > sortedWeights[index - 1].weight ? 'Increasing' : 
          weight.weight < sortedWeights[index - 1].weight ? 'Decreasing' : 'Stable',
        'BMI (estimated 175cm)': (weight.weight / (1.75 * 1.75)).toFixed(1)
      }))
      const ws6 = XLSX.utils.json_to_sheet(weightProgressData)
      XLSX.utils.book_append_sheet(wb, ws6, 'Weight Progress')
    }

    // 7. Weekly Summary
    const weeklySummary = Object.entries(groupByTimePeriod(filteredExercises))
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([period, exercises]) => {
        const totalSets = exercises.reduce((sum, ex) => {
          return sum + (Array.isArray(ex.sets) ? ex.sets.length : ex.sets);
        }, 0)
        const totalVolume = exercises.reduce((sum, ex) => {
          const sets = Array.isArray(ex.sets) ? ex.sets.length : ex.sets;
          return sum + (sets * ex.weight);
        }, 0)
        const bodyParts = [...new Set(exercises.map(ex => ex.bodyPart))]
        
        return {
          'Week Period': period,
          'Total Exercises': exercises.length,
          'Total Sets': totalSets,
          'Total Volume (kg)': totalVolume.toFixed(2),
          'Body Parts Trained': bodyParts.length,
          'Body Parts List': bodyParts.join(', '),
          'Average Volume per Exercise': (totalVolume / exercises.length).toFixed(2),
          'Average Volume per Set': (totalVolume / totalSets).toFixed(2),
          'Workout Days': [...new Set(exercises.map(ex => ex.date))].length
        }
      })
    const ws7 = XLSX.utils.json_to_sheet(weeklySummary)
    XLSX.utils.book_append_sheet(wb, ws7, 'Weekly Summary')

    // Download the comprehensive file
    const fileName = `gym_complete_analysis_${currentUser}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Recent exercises for editing
  const recentExercises = filteredExercises.slice(0, 10)

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Progress Analytics</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportExercisesToExcel}
              className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-green-400 border border-green-500/30"
              title="Export exercise data to Excel"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button
              onClick={exportChartsToExcel}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-blue-400 border border-blue-500/30"
              title="Export chart data to Excel"
            >
              <Download className="w-4 h-4" />
              Export Charts
            </button>
            <button
              onClick={exportAllToExcel}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors text-purple-400 border border-purple-500/30"
              title="Export complete analysis to Excel"
            >
              <Download className="w-4 h-4" />
              Export All
            </button>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'bodypart', label: 'Body Part', icon: Target },
              { id: 'exercise', label: 'Exercise', icon: TrendingUp },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              { id: 'body3d', label: '3D Body', icon: User }
            ].map(mode => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    viewMode === mode.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {mode.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'week', label: 'Last 7 Days' },
          { id: 'month', label: 'Last 30 Days' },
          { id: 'all', label: 'All Time' }
        ].map(range => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === range.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Body Part Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-white font-medium text-sm flex items-center mr-3">Filter by Body Part:</span>
        {[
          { id: 'all', label: 'All Body Parts', icon: '🎯' },
          { id: 'chest', label: 'Chest', icon: '💪' },
          { id: 'back', label: 'Back', icon: '🏋️' },
          { id: 'shoulders', label: 'Shoulders', icon: '🤸' },
          { id: 'arms', label: 'Arms', icon: '💪' },
          { id: 'legs', label: 'Legs', icon: '🦵' },
          { id: 'core', label: 'Core', icon: '🔥' },
          { id: 'glutes', label: 'Glutes', icon: '🍑' },
          { id: 'warmup', label: 'Warmup', icon: '🔥' },
          { id: 'stretches', label: 'Stretches', icon: '🧘' }
        ].map(bodyPart => (
          <button
            key={bodyPart.id}
            onClick={() => setBodyPartFilter(bodyPart.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
              bodyPartFilter === bodyPart.id 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <span>{bodyPart.icon}</span>
            {bodyPart.label}
          </button>
        ))}
      </div>

      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{totalWorkouts}</div>
              <div className="text-sm text-gray-300">Total Workouts</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{totalExercises}</div>
              <div className="text-sm text-gray-300">Total Exercises</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{bodyPartsWorked}</div>
              <div className="text-sm text-gray-300">Body Parts</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{totalVolume.toFixed(0)}kg</div>
              <div className="text-sm text-gray-300">Total Volume</div>
            </div>
          </div>

          {/* Quick Export Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Quick Export</h3>
                <p className="text-sm text-gray-300">Download your gym data and progress charts as Excel files</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportExercisesToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-green-400 border border-green-500/30 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Data
                </button>
                <button
                  onClick={exportChartsToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-blue-400 border border-blue-500/30 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Charts
                </button>
                <button
                  onClick={exportAllToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors text-purple-400 border border-purple-500/30 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  All Data
                </button>
              </div>
            </div>
          </div>

          {/* Daily Progress Bar Chart */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daily Progress (Last 7 Days)
            </h3>
            <div className="space-y-4">
              {(() => {
                const maxVolume = Math.max(...dailyProgress.map(d => d.volume), 1)
                const maxExercises = Math.max(...dailyProgress.map(d => d.exercises), 1)
                
                return (
                  <div className="space-y-6">
                    {/* Volume Bar Chart */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Total Volume (kg)</h4>
                      <div className="space-y-2">
                        {dailyProgress.map((day, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-16 text-xs text-gray-400 text-right">
                              {day.displayDate}
                            </div>
                            <div className="flex-1 bg-white/10 rounded-full h-6 relative">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                style={{ width: `${(day.volume / maxVolume) * 100}%` }}
                              >
                                {day.volume > 0 && (
                                  <span className="text-xs font-semibold text-white">
                                    {day.volume.toFixed(0)}kg
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Exercise Count Bar Chart */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Exercise Count</h4>
                      <div className="space-y-2">
                        {dailyProgress.map((day, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-16 text-xs text-gray-400 text-right">
                              {day.displayDate}
                            </div>
                            <div className="flex-1 bg-white/10 rounded-full h-6 relative">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-400 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                style={{ width: `${(day.exercises / maxExercises) * 100}%` }}
                              >
                                {day.exercises > 0 && (
                                  <span className="text-xs font-semibold text-white">
                                    {day.exercises}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Progress Over Time Line Chart */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress Over Time
            </h3>
            <div className="space-y-6">
              {(() => {
                const maxVolume = Math.max(...progressOverTime.map(d => d.volume), 1)
                const maxWeight = Math.max(...progressOverTime.filter(d => d.weight).map(d => d.weight!), 1)
                const chartHeight = 200
                const chartWidth = 800
                
                return (
                  <div className="overflow-x-auto">
                    <div style={{ minWidth: '800px' }}>
                      {/* Volume Line Chart */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Training Volume Over Time</h4>
                        <div className="relative">
                          <svg width={chartWidth} height={chartHeight} className="border border-white/10 rounded-lg bg-white/5">
                            {/* Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                              <line
                                key={ratio}
                                x1="40"
                                y1={40 + (chartHeight - 80) * ratio}
                                x2={chartWidth - 40}
                                y2={40 + (chartHeight - 80) * ratio}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                              />
                            ))}
                            
                            {/* Y-axis labels */}
                            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                              <text
                                key={ratio}
                                x="35"
                                y={40 + (chartHeight - 80) * (1 - ratio) + 5}
                                fill="rgba(255,255,255,0.6)"
                                fontSize="12"
                                textAnchor="end"
                              >
                                {(maxVolume * ratio).toFixed(0)}
                              </text>
                            ))}
                            
                            {/* Line path for volume */}
                            <path
                              d={progressOverTime.map((point, index) => {
                                const x = 40 + (index * (chartWidth - 80)) / (progressOverTime.length - 1)
                                const y = chartHeight - 40 - ((point.volume / maxVolume) * (chartHeight - 80))
                                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                              }).join(' ')}
                              stroke="url(#volumeGradient)"
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            
                            {/* Data points */}
                            {progressOverTime.map((point, index) => {
                              const x = 40 + (index * (chartWidth - 80)) / (progressOverTime.length - 1)
                              const y = chartHeight - 40 - ((point.volume / maxVolume) * (chartHeight - 80))
                              return (
                                <g key={index}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#3b82f6"
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                  {point.volume > 0 && (
                                    <text
                                      x={x}
                                      y={y - 10}
                                      fill="white"
                                      fontSize="10"
                                      textAnchor="middle"
                                      className="pointer-events-none"
                                    >
                                      {point.volume.toFixed(0)}
                                    </text>
                                  )}
                                </g>
                              )
                            })}
                            
                            {/* X-axis labels */}
                            {progressOverTime.filter((_, index) => index % Math.ceil(progressOverTime.length / 7) === 0).map((point, index, filtered) => {
                              const originalIndex = progressOverTime.indexOf(point)
                              const x = 40 + (originalIndex * (chartWidth - 80)) / (progressOverTime.length - 1)
                              return (
                                <text
                                  key={originalIndex}
                                  x={x}
                                  y={chartHeight - 20}
                                  fill="rgba(255,255,255,0.6)"
                                  fontSize="10"
                                  textAnchor="middle"
                                >
                                  {point.displayDate}
                                </text>
                              )
                            })}
                            
                            {/* Gradient definition */}
                            <defs>
                              <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                              <linearGradient id="weightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>

                      {/* Weight Progress Line Chart */}
                      {weights.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Body Weight Progress</h4>
                          <div className="relative">
                            <svg width={chartWidth} height={chartHeight} className="border border-white/10 rounded-lg bg-white/5">
                              {/* Grid lines */}
                              {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                                <line
                                  key={ratio}
                                  x1="40"
                                  y1={40 + (chartHeight - 80) * ratio}
                                  x2={chartWidth - 40}
                                  y2={40 + (chartHeight - 80) * ratio}
                                  stroke="rgba(255,255,255,0.1)"
                                  strokeWidth="1"
                                />
                              ))}
                              
                              {/* Y-axis labels for weight */}
                              {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                                const minWeight = Math.min(...weights.map(w => w.weight))
                                const weightRange = maxWeight - minWeight
                                const weightValue = minWeight + (weightRange * ratio)
                                return (
                                  <text
                                    key={ratio}
                                    x="35"
                                    y={40 + (chartHeight - 80) * (1 - ratio) + 5}
                                    fill="rgba(255,255,255,0.6)"
                                    fontSize="12"
                                    textAnchor="end"
                                  >
                                    {weightValue.toFixed(1)}
                                  </text>
                                )
                              })}
                              
                              {/* Line path for weight */}
                              {(() => {
                                const sortedWeights = weights.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                const minWeight = Math.min(...weights.map(w => w.weight))
                                const weightRange = maxWeight - minWeight || 1
                                
                                return (
                                  <>
                                    <path
                                      d={sortedWeights.map((point, index) => {
                                        const x = 40 + (index * (chartWidth - 80)) / (sortedWeights.length - 1)
                                        const y = chartHeight - 40 - (((point.weight - minWeight) / weightRange) * (chartHeight - 80))
                                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                                      }).join(' ')}
                                      stroke="url(#weightGradient)"
                                      strokeWidth="3"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    
                                    {/* Data points for weight */}
                                    {sortedWeights.map((point, index) => {
                                      const x = 40 + (index * (chartWidth - 80)) / (sortedWeights.length - 1)
                                      const y = chartHeight - 40 - (((point.weight - minWeight) / weightRange) * (chartHeight - 80))
                                      return (
                                        <g key={index}>
                                          <circle
                                            cx={x}
                                            cy={y}
                                            r="4"
                                            fill="#10b981"
                                            stroke="white"
                                            strokeWidth="2"
                                          />
                                          <text
                                            x={x}
                                            y={y - 10}
                                            fill="white"
                                            fontSize="10"
                                            textAnchor="middle"
                                            className="pointer-events-none"
                                          >
                                            {point.weight.toFixed(1)}
                                          </text>
                                        </g>
                                      )
                                    })}
                                    
                                    {/* X-axis labels for weight chart */}
                                    {sortedWeights.filter((_, index) => index % Math.ceil(sortedWeights.length / 7) === 0).map((point, index) => {
                                      const originalIndex = sortedWeights.indexOf(point)
                                      const x = 40 + (originalIndex * (chartWidth - 80)) / (sortedWeights.length - 1)
                                      return (
                                        <text
                                          key={originalIndex}
                                          x={x}
                                          y={chartHeight - 20}
                                          fill="rgba(255,255,255,0.6)"
                                          fontSize="10"
                                          textAnchor="middle"
                                        >
                                          {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </text>
                                      )
                                    })}
                                  </>
                                )
                              })()}
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Recent Exercises with Edit/Delete */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Exercises (Editable)</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-white/10 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{exercise.name || exercise.exerciseName}</h4>
                      <p className="text-sm text-gray-300 capitalize">{exercise.bodyPart} • {exercise.date}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(() => {
                      const exerciseSets = Array.isArray(exercise.sets) 
                        ? exercise.sets 
                        : [{ reps: exercise.reps || 0, weight: exercise.weight || 0 }];
                      
                      return exerciseSets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                        >
                          <span className="text-sm text-gray-300">Set {setIndex + 1}</span>
                          
                          <div className="flex items-center gap-4">
                            {/* Reps */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">Reps:</span>
                              {editingExercise?.id === exercise.id && 
                               editingExercise.setIndex === setIndex && 
                               editingExercise.field === 'reps' ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editingExercise.value}
                                    onChange={(e) => setEditingExercise({
                                      ...editingExercise,
                                      value: e.target.value
                                    })}
                                    className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={handleEditSave}
                                    className="p-1 rounded bg-green-500/20 hover:bg-green-500/30"
                                  >
                                    <Save className="w-3 h-3 text-green-400" />
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    className="p-1 rounded bg-red-500/20 hover:bg-red-500/30"
                                  >
                                    <X className="w-3 h-3 text-red-400" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditStart(exercise.id, setIndex, 'reps', set.reps)}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                  <span className="text-white font-medium">{set.reps}</span>
                                  <Edit2 className="w-3 h-3 text-gray-400" />
                                </button>
                              )}
                            </div>

                            {/* Weight */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">Weight:</span>
                              {editingExercise?.id === exercise.id && 
                               editingExercise.setIndex === setIndex && 
                               editingExercise.field === 'weight' ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editingExercise.value}
                                    onChange={(e) => setEditingExercise({
                                      ...editingExercise,
                                      value: e.target.value
                                    })}
                                    className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={handleEditSave}
                                    className="p-1 rounded bg-green-500/20 hover:bg-green-500/30"
                                  >
                                    <Save className="w-3 h-3 text-green-400" />
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    className="p-1 rounded bg-red-500/20 hover:bg-red-500/30"
                                  >
                                    <X className="w-3 h-3 text-red-400" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditStart(exercise.id, setIndex, 'weight', set.weight)}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                  <span className="text-white font-medium">{set.weight}kg</span>
                                  <Edit2 className="w-3 h-3 text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'bodypart' && (
        <div className="space-y-6">
          {/* Body Part Selector */}
          <div className="flex flex-wrap gap-2">
            {bodyPartStats.map(stat => (
              <button
                key={stat.bodyPart}
                onClick={() => setSelectedBodyPart(stat.bodyPart)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  selectedBodyPart === stat.bodyPart 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {stat.bodyPart} ({stat.exercises})
              </button>
            ))}
          </div>

          {/* Body Part Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bodyPartStats.map((stat, index) => (
              <div
                key={stat.bodyPart}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold text-white capitalize mb-2">{stat.bodyPart}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Exercises:</span>
                    <span className="text-white font-medium">{stat.exercises}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sets:</span>
                    <span className="text-white font-medium">{stat.sets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volume:</span>
                    <span className="text-white font-medium">{stat.volume.toFixed(0)}kg</span>
                  </div>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min((stat.volume / Math.max(...bodyPartStats.map(s => s.volume))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'exercise' && (
        <div className="space-y-6">
          {/* Exercise Selector */}
          <div>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Select an exercise...</option>
              {uniqueExercises.map(exercise => (
                <option key={exercise} value={exercise} className="bg-gray-800">
                  {exercise}
                </option>
              ))}
            </select>
          </div>

          {selectedExercise && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{selectedExercise} Progress</h3>
              
              {(() => {
                const progressData = getExerciseProgress(selectedExercise)
                
                if (progressData.length === 0) {
                  return <p className="text-gray-400">No data available for this exercise.</p>
                }

                const latestData = progressData[progressData.length - 1]
                const firstData = progressData[0]
                const weightProgress = latestData.maxWeight - firstData.maxWeight
                const volumeProgress = latestData.volume - firstData.volume

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{latestData.maxWeight}kg</div>
                        <div className="text-sm text-gray-300">Max Weight</div>
                        {weightProgress !== 0 && (
                          <div className={`text-xs ${weightProgress > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {weightProgress > 0 ? '+' : ''}{weightProgress.toFixed(1)}kg
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{latestData.totalReps}</div>
                        <div className="text-sm text-gray-300">Total Reps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{latestData.volume.toFixed(0)}kg</div>
                        <div className="text-sm text-gray-300">Volume</div>
                        {volumeProgress !== 0 && (
                          <div className={`text-xs ${volumeProgress > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {volumeProgress > 0 ? '+' : ''}{volumeProgress.toFixed(0)}kg
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{progressData.length}</div>
                        <div className="text-sm text-gray-300">Sessions</div>
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Progress Timeline</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {progressData.map((data, index) => (
                          <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <span className="text-gray-300">{new Date(data.date).toLocaleDateString()}</span>
                            <div className="flex gap-4 text-sm">
                              <span className="text-blue-400">{data.maxWeight}kg</span>
                              <span className="text-green-400">{data.totalReps} reps</span>
                              <span className="text-purple-400">{data.volume.toFixed(0)}kg vol</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Workout Timeline</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(timelineData)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([period, exercises]) => {
                  const totalSets = exercises.reduce((sum, ex) => {
                    return sum + (Array.isArray(ex.sets) ? ex.sets.length : ex.sets);
                  }, 0)
                  const totalVolume = exercises.reduce((sum, ex) => {
                    const sets = Array.isArray(ex.sets) ? ex.sets.length : ex.sets;
                    return sum + (sets * ex.weight);
                  }, 0)

                  return (
                    <div key={period} className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{period}</h4>
                        <div className="flex gap-4 text-sm text-gray-300">
                          <span>{exercises.length} exercises</span>
                          <span>{totalSets} sets</span>
                          <span>{totalVolume.toFixed(0)}kg volume</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[...new Set(exercises.map(ex => ex.bodyPart))].map(bodyPart => (
                          <div key={bodyPart} className="text-center">
                            <div className="text-xs text-gray-400 capitalize">{bodyPart}</div>
                            <div className="text-sm text-white">
                              {exercises.filter(ex => ex.bodyPart === bodyPart).length}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'body3d' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Muscle Usage Heat Map
            </h3>
            
            {(() => {
              // Calculate muscle usage intensity
              const muscleUsage = bodyPartStats.reduce((acc, stat) => {
                acc[stat.bodyPart] = stat.volume
                return acc
              }, {} as { [key: string]: number })
              
              const maxUsage = Math.max(...Object.values(muscleUsage), 1)
              
              // Helper function to get color intensity based on usage
              const getIntensityColor = (bodyPart: string) => {
                const usage = muscleUsage[bodyPart] || 0
                const intensity = usage / maxUsage
                
                if (intensity === 0) return '#374151' // Gray for unused
                if (intensity < 0.2) return '#fef3c7' // Very light yellow
                if (intensity < 0.4) return '#fbbf24' // Light yellow
                if (intensity < 0.6) return '#f59e0b' // Orange
                if (intensity < 0.8) return '#dc2626' // Red
                return '#991b1b' // Dark red for highest usage
              }
              
              const getIntensityOpacity = (bodyPart: string) => {
                const usage = muscleUsage[bodyPart] || 0
                const intensity = usage / maxUsage
                return Math.max(0.3, intensity)
              }

              return (
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                  {/* Human Body Visualization */}
                  <div className="relative">
                    <svg
                      width="300"
                      height="500"
                      viewBox="0 0 300 500"
                      className="mx-auto"
                    >
                      {/* Body outline */}
                      <path
                        d="M150 20 C140 20 130 30 130 40 L130 60 C120 65 110 80 110 100 L110 200 C110 220 120 240 130 250 L130 350 C130 360 125 370 120 380 L110 420 L110 460 C110 470 115 480 125 480 L140 480 L140 490 C140 495 145 500 150 500 C155 500 160 495 160 490 L160 480 L175 480 C185 480 190 470 190 460 L190 420 L180 380 C175 370 170 360 170 350 L170 250 C180 240 190 220 190 200 L190 100 C190 80 180 65 170 60 L170 40 C170 30 160 20 150 20 Z"
                        fill="rgba(55, 65, 81, 0.3)"
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="2"
                      />
                      
                      {/* Head */}
                      <circle
                        cx="150"
                        cy="35"
                        r="15"
                        fill={getIntensityColor('head')}
                        fillOpacity={getIntensityOpacity('head')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      
                      {/* Shoulders */}
                      <ellipse
                        cx="130"
                        cy="80"
                        rx="15"
                        ry="20"
                        fill={getIntensityColor('shoulders')}
                        fillOpacity={getIntensityOpacity('shoulders')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      <ellipse
                        cx="170"
                        cy="80"
                        rx="15"
                        ry="20"
                        fill={getIntensityColor('shoulders')}
                        fillOpacity={getIntensityOpacity('shoulders')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      
                      {/* Chest */}
                      <ellipse
                        cx="150"
                        cy="110"
                        rx="30"
                        ry="25"
                        fill={getIntensityColor('chest')}
                        fillOpacity={getIntensityOpacity('chest')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      
                      {/* Back (represented as side areas) */}
                      <ellipse
                        cx="120"
                        cy="140"
                        rx="8"
                        ry="30"
                        fill={getIntensityColor('back')}
                        fillOpacity={getIntensityOpacity('back')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      <ellipse
                        cx="180"
                        cy="140"
                        rx="8"
                        ry="30"
                        fill={getIntensityColor('back')}
                        fillOpacity={getIntensityOpacity('back')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      
                      {/* Arms */}
                      <ellipse
                        cx="100"
                        cy="120"
                        rx="10"
                        ry="25"
                        fill={getIntensityColor('arms')}
                        fillOpacity={getIntensityOpacity('arms')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      <ellipse
                        cx="200"
                        cy="120"
                        rx="10"
                        ry="25"
                        fill={getIntensityColor('arms')}
                        fillOpacity={getIntensityOpacity('arms')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      
                      {/* Core */}
                      <ellipse
                        cx="150"
                        cy="180"
                        rx="25"
                        ry="30"
                        fill={getIntensityColor('core')}
                        fillOpacity={getIntensityOpacity('core')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      
                      {/* Glutes */}
                      <ellipse
                        cx="150"
                        cy="230"
                        rx="20"
                        ry="15"
                        fill={getIntensityColor('glutes')}
                        fillOpacity={getIntensityOpacity('glutes')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      
                      {/* Legs */}
                      <ellipse
                        cx="135"
                        cy="320"
                        rx="15"
                        ry="60"
                        fill={getIntensityColor('legs')}
                        fillOpacity={getIntensityOpacity('legs')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      <ellipse
                        cx="165"
                        cy="320"
                        rx="15"
                        ry="60"
                        fill={getIntensityColor('legs')}
                        fillOpacity={getIntensityOpacity('legs')}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="1"
                      />
                      
                      {/* Body part labels */}
                      <text x="150" y="25" textAnchor="middle" fill="white" fontSize="10">Head</text>
                      <text x="90" y="85" textAnchor="middle" fill="white" fontSize="8">Shoulders</text>
                      <text x="150" y="100" textAnchor="middle" fill="white" fontSize="10">Chest</text>
                      <text x="80" y="130" textAnchor="middle" fill="white" fontSize="8">Arms</text>
                      <text x="150" y="170" textAnchor="middle" fill="white" fontSize="10">Core</text>
                      <text x="100" y="140" textAnchor="middle" fill="white" fontSize="8" transform="rotate(-90 100 140)">Back</text>
                      <text x="150" y="245" textAnchor="middle" fill="white" fontSize="10">Glutes</text>
                      <text x="150" y="400" textAnchor="middle" fill="white" fontSize="10">Legs</text>
                    </svg>
                  </div>
                  
                  {/* Legend and Statistics */}
                  <div className="space-y-6">
                    {/* Heat Map Legend */}
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Heat Map Legend</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-gray-600"></div>
                          <span className="text-sm text-gray-300">No training</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-yellow-200"></div>
                          <span className="text-sm text-gray-300">Light training</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-yellow-500"></div>
                          <span className="text-sm text-gray-300">Moderate training</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-orange-500"></div>
                          <span className="text-sm text-gray-300">Heavy training</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-red-600"></div>
                          <span className="text-sm text-gray-300">Intense training</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-red-900"></div>
                          <span className="text-sm text-gray-300">Maximum training</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Usage Statistics */}
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Usage Statistics</h4>
                      <div className="space-y-3">
                        {bodyPartStats
                          .sort((a, b) => b.volume - a.volume)
                          .map((stat, index) => (
                          <div key={stat.bodyPart} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: getIntensityColor(stat.bodyPart) }}
                              ></div>
                              <span className="text-sm text-white capitalize">{stat.bodyPart}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-white">{stat.volume.toFixed(0)}kg</div>
                              <div className="text-xs text-gray-400">{stat.exercises} exercises</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Training Balance Analysis */}
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Balance Analysis</h4>
                      <div className="space-y-2">
                        {(() => {
                          const totalVolume = bodyPartStats.reduce((sum, stat) => sum + stat.volume, 0)
                          const averageVolume = totalVolume / bodyPartStats.length
                          const mostTrained = bodyPartStats.reduce((max, stat) => 
                            stat.volume > max.volume ? stat : max, bodyPartStats[0] || { bodyPart: 'none', volume: 0 })
                          const leastTrained = bodyPartStats.reduce((min, stat) => 
                            stat.volume < min.volume ? stat : min, bodyPartStats[0] || { bodyPart: 'none', volume: 0 })
                          
                          return (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Most trained:</span>
                                <span className="text-green-400 capitalize font-medium">{mostTrained.bodyPart}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Least trained:</span>
                                <span className="text-red-400 capitalize font-medium">{leastTrained.bodyPart}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Average volume:</span>
                                <span className="text-blue-400 font-medium">{averageVolume.toFixed(0)}kg</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Balance ratio:</span>
                                <span className="text-purple-400 font-medium">
                                  {leastTrained.volume > 0 ? (mostTrained.volume / leastTrained.volume).toFixed(1) : '∞'}:1
                                </span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}