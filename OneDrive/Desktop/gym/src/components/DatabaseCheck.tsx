'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase/client'

export default function DatabaseCheck() {
  const [checkResult, setCheckResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const checkDatabase = async () => {
    setLoading(true)
    setCheckResult('')

    try {
      // Check if users table exists and has data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (usersError) {
        setCheckResult(`❌ Users table error: ${usersError.message}`)
        setLoading(false)
        return
      }

      // Check if exercise_sets table exists
      const { data: exerciseSets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*')
        .limit(1)

      if (setsError) {
        setCheckResult(`❌ Exercise sets table error: ${setsError.message}`)
        setLoading(false)
        return
      }

      // Check if workout_sessions table exists
      const { data: sessions, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .limit(1)

      if (sessionsError) {
        setCheckResult(`❌ Workout sessions table error: ${sessionsError.message}`)
        setLoading(false)
        return
      }

      setCheckResult(`✅ Database is ready! Found ${users?.length || 0} users, ${exerciseSets?.length || 0} exercise sets, ${sessions?.length || 0} workout sessions.`)
    } catch (error) {
      setCheckResult(`❌ Connection error: ${error}`)
    }

    setLoading(false)
  }

  const deploySchema = () => {
    setCheckResult(`
📋 To deploy the database schema:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Open your project: https://ddktxmfbdqrrnynuzoyl.supabase.co
3. Navigate to: SQL Editor
4. Copy the entire content from: supabase_schema.sql
5. Paste and run the SQL script
6. Click "Run" to create all tables

⚠️ The database schema must be deployed before the application can save data!
    `)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Database Health Check</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Database'}
          </button>
          
          <button
            onClick={deploySchema}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
          >
            Show Deploy Instructions
          </button>
        </div>

        {checkResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{checkResult}</pre>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="font-semibold text-yellow-800 mb-2">⚠️ Important Note</h2>
        <p className="text-yellow-700">
          If you see table errors above, you need to deploy the database schema first. 
          The SQL schema is located in <code>supabase_schema.sql</code> in your project root.
        </p>
      </div>
    </div>
  )
}