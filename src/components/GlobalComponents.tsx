'use client'

import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export default function GlobalComponents() {
  const { user } = useAuth()
  
  // Always call the hook, but it will handle the user check internally
  useGlobalShortcuts()
  
  return null
}

