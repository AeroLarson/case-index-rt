'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Automatic Case Monitor Component
 * Checks saved cases for updates every 4 hours (a few times a day)
 */
export default function CaseMonitor() {
  const { user, refreshProfile } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<number>(0)

  useEffect(() => {
    if (!user) return

    // Check immediately on mount if it's been more than 4 hours since last check
    const checkForUpdates = async () => {
      const now = Date.now()
      const fourHours = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
      
      // Only check if it's been more than 4 hours since last check
      if (now - lastCheckRef.current < fourHours) {
        return
      }

      try {
        console.log('🔍 Automatic case monitoring: Checking for updates...')
        const response = await fetch('/api/cases/monitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.id}`
          },
          body: JSON.stringify({ userId: user.id })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Case monitoring complete:', data.message)
          if (data.updates && data.updates.length > 0) {
            console.log(`📬 Found ${data.updates.length} case(s) with updates`)
            // Refresh profile to show new notifications
            refreshProfile()
          }
          lastCheckRef.current = now
        }
      } catch (error) {
        console.error('❌ Case monitoring error:', error)
      }
    }

    // Check immediately
    checkForUpdates()

    // Set up interval to check every 4 hours
    intervalRef.current = setInterval(checkForUpdates, 4 * 60 * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [user, refreshProfile])

  return null // This component doesn't render anything
}
