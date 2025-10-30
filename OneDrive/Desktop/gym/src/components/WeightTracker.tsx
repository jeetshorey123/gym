'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Scale, TrendingUp, TrendingDown } from 'lucide-react'
import { 
  getCurrentUser, 
  saveWeight, 
  getWeights, 
  deleteWeight,
  type WeightEntry 
} from '@/lib/localStorage'

export default function WeightTracker() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    if (user) {
      loadWeights(user)
    }
  }, [])

  const loadWeights = (user: string) => {
    const weights = getWeights(user)
    // Sort by date descending
    const sortedWeights = weights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setWeightEntries(sortedWeights)
  }

  const handleAddWeight = async () => {
    if (!currentUser || !newWeight) {
      alert('Please enter a weight')
      return
    }

    setLoading(true)

    try {
      const newEntry = saveWeight({
        user: currentUser,
        date: newDate,
        weight: parseFloat(newWeight)
      })

      setWeightEntries(prev => [newEntry, ...prev])
      
      // Reset form
      setNewWeight('')
      setNewDate(new Date().toISOString().split('T')[0])
    } catch (error) {
      console.error('Error adding weight:', error)
      alert('Failed to add weight')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWeight = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weight entry?')) return

    try {
      deleteWeight(id)
      setWeightEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting weight:', error)
      alert('Failed to delete weight')
    }
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to track your weight</p>
      </div>
    )
  }

  // Calculate stats
  const latestWeight = weightEntries[0]?.weight || 0
  const previousWeight = weightEntries[1]?.weight || latestWeight
  const weightChange = latestWeight - previousWeight
  const isGaining = weightChange > 0
  const isLosing = weightChange < 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Weight Tracker</h2>
        <p className="text-gray-600">Monitor your weight progress over time</p>
      </div>

      {/* Add Weight Form */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Weight Entry</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Enter your weight"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddWeight}
          disabled={loading || !newWeight}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Adding...' : 'Add Weight Entry'}
        </button>
      </div>

      {/* Weight Stats */}
      {weightEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
            <Scale className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">{latestWeight}kg</div>
            <div className="text-sm text-gray-600">Current Weight</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
            {isGaining ? (
              <TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
            ) : isLosing ? (
              <TrendingDown className="w-8 h-8 mx-auto text-red-600 mb-2" />
            ) : (
              <Scale className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            )}
            <div className={`text-2xl font-bold ${isGaining ? 'text-green-600' : isLosing ? 'text-red-600' : 'text-gray-600'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
            </div>
            <div className="text-sm text-gray-600">Change from Last Entry</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-800">{weightEntries.length}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
        </div>
      )}

      {/* Weight History */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weight History</h3>

        {weightEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No weight entries recorded yet. Add your first entry above!
          </p>
        ) : (
          <div className="space-y-3">
            {weightEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    {entry.weight}kg
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteWeight(entry.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Insights */}
      {weightEntries.length >= 2 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Weight Range</h4>
              <div className="text-sm text-gray-600">
                Lowest: {Math.min(...weightEntries.map(e => e.weight)).toFixed(1)}kg
              </div>
              <div className="text-sm text-gray-600">
                Highest: {Math.max(...weightEntries.map(e => e.weight)).toFixed(1)}kg
              </div>
            </div>

            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Tracking Period</h4>
              <div className="text-sm text-gray-600">
                {weightEntries.length > 0 && (
                  <>
                    From: {new Date(weightEntries[weightEntries.length - 1].date).toLocaleDateString()}
                    <br />
                    To: {new Date(weightEntries[0].date).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}