'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AccountPage() {
  const router = useRouter()

  useEffect(() => {
    // Temporarily redirect to dashboard while account page is being fixed
    router.push('/')
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting...</p>
      </div>
    </main>
  )
}
