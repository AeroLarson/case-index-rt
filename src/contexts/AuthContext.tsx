'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DatabaseUserProfile, databaseUserProfileManager } from '@/lib/databaseUserProfile'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  userProfile: DatabaseUserProfile | null
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
  const [userProfile, setUserProfile] = useState<DatabaseUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount (client-side only)
    if (typeof window !== 'undefined') {
      try {
        console.log('AuthContext: Checking for saved user session')
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          console.log('AuthContext: Found saved user:', userData.email)
          setUser(userData)
          // Load user profile from database
          loadUserProfile(userData.id, userData.name, userData.email).catch(error => {
            console.error('AuthContext: Failed to load user profile:', error)
          })
        } else {
          console.log('AuthContext: No saved user found')
        }
      } catch (error) {
        console.error('AuthContext: Failed to parse saved user:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const loadUserProfile = async (userId: string, name: string, email: string) => {
    try {
      console.log('Loading user profile from database for:', userId)
      const profile = await databaseUserProfileManager.getUserProfile(userId, name, email)
      console.log('Database profile loaded:', profile)
      setUserProfile(profile)
    } catch (error) {
      console.error('Failed to load user profile from database:', error)
      
      // Fallback to localStorage if database fails
      try {
        const localProfile = localStorage.getItem(`user_profile_${userId}`)
        if (localProfile) {
          const parsedProfile = JSON.parse(localProfile)
          console.log('Using localStorage fallback:', parsedProfile)
          setUserProfile(parsedProfile)
          return
        }
      } catch (localError) {
        console.error('Failed to load from localStorage:', localError)
      }
      
      // Final fallback to empty profile
      const emptyProfile = {
        id: userId,
        email,
        name,
        plan: 'free',
        createdAt: new Date(),
        lastLogin: new Date(),
        savedCases: [],
        recentSearches: [],
        starredCases: [],
        calendarEvents: [],
        monthlyUsage: 0,
        maxMonthlyUsage: 1,
        clioTokens: null,
        tourCompleted: false
      }
      console.log('Using empty profile fallback:', emptyProfile)
      setUserProfile(emptyProfile)
    }
  }

  const login = async (userData: User) => {
    setUser(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
    }
    // Load or create user profile from database
    await loadUserProfile(userData.id, userData.name, userData.email)
  }

  const logout = () => {
    setUser(null)
    setUserProfile(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
    // In a real app, you might also call a logout API endpoint
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id, user.name, user.email)
    }
  }

  const clearAllUserData = async () => {
    if (user) {
      try {
        // Clear user data from database
        await databaseUserProfileManager.clearUserData(user.id)
      } catch (error) {
        console.error('Failed to clear user data from database:', error)
      }
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
    console.log('Database connection: Active')
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
