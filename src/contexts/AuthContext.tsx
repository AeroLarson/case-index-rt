'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserProfile, userProfileManager } from '@/lib/userProfile'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
  refreshProfile: () => void
  clearAllUserData: () => void
  debugUserData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple session restoration
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          // Don't restore test user or simulation users
          if (userData.id && userData.name && userData.email && 
              !userData.id.startsWith('sim_') && 
              userData.name !== 'Test User' &&
              userData.email !== 'test@example.com') {
            setUser(userData)
            const profile = userProfileManager.getUserProfile(userData.id, userData.name, userData.email)
            setUserProfile(profile)
          } else {
            // Clear test user data
            console.log('Clearing test user data from localStorage')
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.warn('AuthContext: Failed to parse saved user:', error)
          localStorage.removeItem('user')
        }
      }
    }
    setIsLoading(false)
  }, [])

  // Simple session persistence check
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user')
        if (!savedUser && user) {
          localStorage.setItem('user', JSON.stringify(user))
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user])

  const login = (userData: User) => {
    setUser(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
    }
    const profile = userProfileManager.getUserProfile(userData.id, userData.name, userData.email)
    setUserProfile(profile)
  }

  const logout = () => {
    setUser(null)
    setUserProfile(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }



  const refreshProfile = () => {
    if (user) {
      const profile = userProfileManager.getUserProfile(user.id, user.name, user.email)
      setUserProfile(profile)
    }
  }

  const clearAllUserData = () => {
    if (user) {
      userProfileManager.clearUserData(user.id)
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
    setUser(null)
    setUserProfile(null)
    console.log('All user data cleared')
  }

  const debugUserData = () => {
    console.log('=== USER DATA DEBUG ===')
    console.log('Current user:', user)
    console.log('Current user profile:', userProfile)
    console.log('User profile manager:', userProfileManager)
    console.log('=== END DEBUG ===')
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, login, logout, isLoading, refreshProfile, clearAllUserData, debugUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
