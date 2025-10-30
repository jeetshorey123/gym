'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, createUser, setCurrentUser } from '@/lib/supabase/database'
import { initializeLocalData } from '@/lib/localStorage'

const USERS = [
  'priya', 'jeet', 'anuj', 'ankur', 'shreya', 'hait', 'veer', 'druav'
]

// User credentials mapping
const USER_CREDENTIALS = {
  'priya': 'elephant',
  'jeet': 'jeet@123',
  'anuj': 'anuj',
  'ankur': 'ankur', 
  'shreya': 'shreya',
  'hait': 'hait',
  'veer': 'veer',
  'druav': 'druav',
  'guest': 'guest',
} as const

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Initialize local storage data on component mount
    initializeLocalData()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if username is in allowed list and password matches the specific password for that user
    const normalizedUsername = username.toLowerCase()
    if (!USERS.includes(normalizedUsername) || password !== USER_CREDENTIALS[normalizedUsername as keyof typeof USER_CREDENTIALS]) {
      setError('Invalid username or password')
      setLoading(false)
      return
    }

    try {
      // Check if user exists in Supabase, create if not
      let user = await getUser(normalizedUsername)
      
      if (!user) {
        // Create new user in Supabase
        user = await createUser({
          username: normalizedUsername,
          full_name: normalizedUsername.charAt(0).toUpperCase() + normalizedUsername.slice(1),
          email: `${normalizedUsername}@gym.local`
        })
        
        if (!user) {
          setError('Failed to create user account')
          setLoading(false)
          return
        }
      }
      
      // Set current user in local storage for session management
      setCurrentUser(normalizedUsername)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💪 Gym Trainer</h1>
          <p className="text-white/70">Sign in to your training account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Username
            </label>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select your name</option>
              {USERS.map((user) => (
                <option key={user} value={user} className="text-black">
                  {user.charAt(0).toUpperCase() + user.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (same as username)"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>Password is the same as your username</p>
          <p className="mt-1">Available users: {USERS.join(', ')}</p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs">
            💻 App created by <span className="text-blue-400 font-semibold">Jeet</span>
          </p>
        </div>
      </div>
    </div>
  )
}