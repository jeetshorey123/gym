'use client'

import { useState, useEffect } from 'react'
import { testConnection } from '@/lib/supabase/client'

export default function DatabaseSetupPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus('checking')
    setError('')
    
    try {
      const isConnected = await testConnection()
      if (isConnected) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('failed')
        setError('Database tables not found or connection failed')
      }
    } catch (err) {
      setConnectionStatus('failed')
      setError(`Connection error: ${err}`)
    }
  }

  const openSupabaseSQL = () => {
    window.open('https://supabase.com/dashboard/project/ddktxmfbdqrrnynuzoyl/sql', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">🗄️ Database Setup</h1>
            <p className="text-white/70 text-lg">Supabase Database Configuration</p>
          </div>

          {/* Connection Status */}
          <div className="mb-8">
            {connectionStatus === 'checking' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">Testing database connection...</p>
              </div>
            )}

            {connectionStatus === 'connected' && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-6 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-300 mb-2">Database Connected!</h2>
                <p className="text-green-200">Your Supabase database is properly configured and ready to use.</p>
                <div className="mt-6 flex gap-4 justify-center">
                  <a
                    href="/login"
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Go to Login
                  </a>
                  <a
                    href="/dashboard"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            )}

            {connectionStatus === 'failed' && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">❌</div>
                  <h2 className="text-2xl font-bold text-red-300 mb-2">Database Setup Required</h2>
                  <p className="text-red-200">The database tables haven't been created yet.</p>
                  {error && (
                    <p className="text-red-300 text-sm mt-2 font-mono bg-red-900/30 p-3 rounded">
                      Error: {error}
                    </p>
                  )}
                </div>

                {/* Setup Instructions */}
                <div className="space-y-6">
                  <div className="bg-white/10 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">📋 Setup Instructions</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                          <h4 className="text-lg font-medium text-white">Open Supabase SQL Editor</h4>
                        </div>
                        <p className="text-white/70 mb-4">Click the button below to open your Supabase project's SQL Editor.</p>
                        <button
                          onClick={openSupabaseSQL}
                          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          Open Supabase SQL Editor
                        </button>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                          <h4 className="text-lg font-medium text-white">Copy SQL Schema</h4>
                        </div>
                        <p className="text-white/70 mb-4">Copy the entire contents of the <code className="bg-white/20 px-2 py-1 rounded">supabase_schema.sql</code> file in your project.</p>
                        <div className="bg-gray-900/50 p-4 rounded text-sm text-gray-300 font-mono">
                          📁 Project Root → supabase_schema.sql
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                          <h4 className="text-lg font-medium text-white">Execute SQL</h4>
                        </div>
                        <p className="text-white/70 mb-4">Paste the SQL code into the editor and click the "Run" button to create all tables.</p>
                        <div className="bg-green-900/30 p-3 rounded text-sm text-green-300">
                          ✨ This will create 10+ tables with sample data and security policies
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                          <h4 className="text-lg font-medium text-white">Test Connection</h4>
                        </div>
                        <p className="text-white/70 mb-4">After running the SQL, click the button below to test the connection.</p>
                        <button
                          onClick={checkConnection}
                          className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition-colors"
                        >
                          Test Connection Again
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Environment Check */}
                  <div className="bg-white/10 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">🔐 Environment Variables</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">NEXT_PUBLIC_SUPABASE_URL:</span>
                        <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-400' : 'text-red-400'}>
                          {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                        <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-400' : 'text-red-400'}>
                          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">🔗 Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://supabase.com/dashboard/project/ddktxmfbdqrrnynuzoyl"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="text-lg font-medium text-white">Supabase Dashboard</div>
                <div className="text-white/70 text-sm">Manage your database</div>
              </a>
              <a
                href="https://supabase.com/dashboard/project/ddktxmfbdqrrnynuzoyl/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="text-lg font-medium text-white">Table Editor</div>
                <div className="text-white/70 text-sm">View your data</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}