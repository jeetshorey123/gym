'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/localStorage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Add a small delay to ensure the page loads properly on Vercel
    const timer = setTimeout(() => {
      try {
        const currentUser = getCurrentUser()
        
        if (currentUser) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch (error) {
        // Fallback to login if there's any error
        router.push('/login')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-6xl mb-6">🏋️‍♂️</div>
        <div className="text-2xl font-bold mb-4">Gym Trainer Pro</div>
        <div className="text-lg opacity-80">Loading your fitness journey...</div>
        <div className="mt-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  )
}
