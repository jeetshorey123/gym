'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Dumbbell, Apple, Scale, TrendingUp, LogOut, History } from 'lucide-react'
import { getCurrentUser, logout } from '@/lib/localStorage'
import WorkoutSchedule from '@/components/WorkoutSchedule'
import ExerciseTracker from '@/components/ExerciseTracker'
import ExerciseHistory from '@/components/ExerciseHistory'
import DietPlanner from '@/components/DietPlanner'
import WeightTracker from '@/components/WeightTracker'
import ProgressChart from '@/components/ProgressChart'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('schedule')
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    } else {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  const handleLogout = async () => {
    logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'exercise', label: 'Exercise', icon: Dumbbell },
    { id: 'history', label: 'History', icon: History },
    { id: 'diet', label: 'Diet', icon: Apple },
    { id: 'weight', label: 'Weight', icon: Scale },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">💪 Gym Trainer</h1>
              {user && (
                <span className="ml-4 text-white/70">
                  Welcome, {user.charAt(0).toUpperCase() + user.slice(1)}!
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-white/70 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'schedule' && <WorkoutSchedule />}
        {activeTab === 'exercise' && <ExerciseTracker />}
        {activeTab === 'history' && <ExerciseHistory />}
        {activeTab === 'diet' && <DietPlanner />}
        {activeTab === 'weight' && <WeightTracker />}
        {activeTab === 'progress' && <ProgressChart />}
      </main>
    </div>
  )
}