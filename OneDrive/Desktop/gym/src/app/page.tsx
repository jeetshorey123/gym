'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/localStorage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in via localStorage
    const currentUser = getCurrentUser()
    
    if (currentUser) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-4xl mb-4">💪</div>
        <div>Loading Gym Trainer...</div>
      </div>
    </div>
  )
}
