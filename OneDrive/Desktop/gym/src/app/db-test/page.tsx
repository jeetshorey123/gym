'use client'

import { useState, useEffect } from 'react'
import { checkDatabaseHealth } from '@/lib/supabase/database'

export default function DatabaseTestPage() {
  const [healthStatus, setHealthStatus] = useState<{
    isHealthy: boolean
    missingTables: string[]
    errors: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testDatabase = async () => {
      setLoading(true)
      try {
        const status = await checkDatabaseHealth()
        setHealthStatus(status)
      } catch (err) {
        console.error('Database test failed:', err)
        setHealthStatus({
          isHealthy: false,
          missingTables: [],
          errors: [`Connection failed: ${err}`]
        })
      } finally {
        setLoading(false)
      }
    }

    testDatabase()
  }, [])

  const runSchemaSetup = () => {
    window.open('https://supabase.com/dashboard/project/ddktxmfbdqrrnynuzoyl/sql', '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Database Health Check</h1>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Testing database connection...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Health Status */}
              <div className={`p-4 rounded-lg border-2 ${
                healthStatus?.isHealthy 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`text-2xl ${
                    healthStatus?.isHealthy ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {healthStatus?.isHealthy ? '✅' : '❌'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Database Status: {healthStatus?.isHealthy ? 'Healthy' : 'Issues Found'}
                    </h2>
                    <p className="text-gray-600">
                      {healthStatus?.isHealthy 
                        ? 'All required tables are present and accessible'
                        : 'Some issues were detected with the database setup'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Missing Tables */}
              {healthStatus?.missingTables && healthStatus.missingTables.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Missing Tables</h3>
                  <div className="space-y-2">
                    {healthStatus.missingTables.map((table) => (
                      <div key={table} className="bg-yellow-100 px-3 py-2 rounded">
                        <code className="text-yellow-800">{table}</code>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-yellow-100 rounded">
                    <p className="text-yellow-800 text-sm">
                      <strong>Solution:</strong> These tables need to be created in your Supabase database.
                    </p>
                  </div>
                </div>
              )}

              {/* Errors */}
              {healthStatus?.errors && healthStatus.errors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">🚫 Database Errors</h3>
                  <div className="space-y-2">
                    {healthStatus.errors.map((error, index) => (
                      <div key={index} className="bg-red-100 px-3 py-2 rounded">
                        <code className="text-red-800 text-sm">{error}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Setup Instructions */}
              {!healthStatus?.isHealthy && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">🛠️ Database Setup Required</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-100 p-4 rounded">
                      <h4 className="font-semibold text-blue-800 mb-2">Step 1: Open Supabase SQL Editor</h4>
                      <button
                        onClick={runSchemaSetup}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Open Supabase SQL Editor
                      </button>
                    </div>
                    
                    <div className="bg-blue-100 p-4 rounded">
                      <h4 className="font-semibold text-blue-800 mb-2">Step 2: Run SQL Schema</h4>
                      <p className="text-blue-700 text-sm mb-2">
                        Copy and paste the contents of <code>supabase_schema.sql</code> into the SQL Editor and click "Run"
                      </p>
                      <p className="text-blue-600 text-xs">
                        This will create all required tables, functions, and sample data.
                      </p>
                    </div>
                    
                    <div className="bg-blue-100 p-4 rounded">
                      <h4 className="font-semibold text-blue-800 mb-2">Step 3: Refresh This Page</h4>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        Refresh Health Check
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {healthStatus?.isHealthy && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">🎉 Database Ready!</h3>
                  <p className="text-green-700 mb-4">
                    Your Supabase database is properly configured and all tables are accessible.
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="/login"
                      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Go to Login
                    </a>
                    <a
                      href="/dashboard"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              )}

              {/* Connection Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🔗 Connection Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Supabase URL:</strong>
                    <br />
                    <code className="text-blue-600">https://ddktxmfbdqrrnynuzoyl.supabase.co</code>
                  </div>
                  <div>
                    <strong className="text-gray-700">Environment:</strong>
                    <br />
                    <code className="text-green-600">Production</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}