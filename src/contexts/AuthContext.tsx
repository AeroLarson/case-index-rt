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
    // Check for existing session on mount (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user')
        console.log('AuthContext: Checking for saved user:', savedUser ? 'Found' : 'Not found')
        
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          console.log('AuthContext: Parsed user data:', userData)
          
          // Basic validation - only check if data exists
          if (userData.id && userData.name && userData.email) {
            console.log('AuthContext: Setting user and loading profile')
            setUser(userData)
            // Load user profile from localStorage
            const profile = userProfileManager.getUserProfile(userData.id, userData.name, userData.email)
            setUserProfile(profile)
            console.log('AuthContext: Profile loaded successfully')
          } else {
            console.log('AuthContext: Invalid user data structure, clearing localStorage')
            localStorage.removeItem('user')
          }
        } else {
          console.log('AuthContext: No saved user found')
        }
      } catch (error) {
        console.warn('AuthContext: Failed to parse saved user:', error)
        // Only clear if there's a parsing error
        localStorage.removeItem('user')
      }
    }
    
    // Always set loading to false after attempting to load user
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    console.log('AuthContext: Logging in user:', userData.email)
    setUser(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
      // Set a session timestamp to track when user logged in
      localStorage.setItem('session_timestamp', Date.now().toString())
    }
    // Load or create user profile from localStorage
    const profile = userProfileManager.getUserProfile(userData.id, userData.name, userData.email)
    setUserProfile(profile)
    console.log('AuthContext: Login completed successfully')
  }

  const logout = () => {
    console.log('AuthContext: Logging out user')
    setUser(null)
    setUserProfile(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('session_timestamp')
    }
    console.log('AuthContext: Logout completed')
    // In a real app, you might also call a logout API endpoint
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
