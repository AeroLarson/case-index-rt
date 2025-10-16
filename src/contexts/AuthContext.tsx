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
  validateSession: () => boolean
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
        let savedUser = localStorage.getItem('user')
        console.log('AuthContext: Checking for saved user:', savedUser ? 'Found' : 'Not found')
        
        // If main user data is missing, try backup locations
        if (!savedUser) {
          console.log('AuthContext: Main user data missing, checking backups...')
          savedUser = sessionStorage.getItem('user_backup') || localStorage.getItem('user_data_backup')
          
          if (savedUser) {
            console.log('AuthContext: Found backup user data, restoring...')
            localStorage.setItem('user', savedUser)
          }
        }
        
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
            console.log('AuthContext: Profile loaded successfully, plan:', profile.plan)
          } else {
            console.log('AuthContext: Invalid user data structure, clearing localStorage')
            localStorage.removeItem('user')
          }
        } else {
          console.log('AuthContext: No saved user found in any location')
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

  // Add a periodic session check to prevent unexpected logouts
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user')
        if (!savedUser && user) {
          console.log('AuthContext: User data lost from localStorage, restoring...')
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('session_timestamp', Date.now().toString())
          sessionStorage.setItem('user_backup', JSON.stringify(user))
        }
        
        // Also check if user state is null but we have backup data
        if (!user && typeof window !== 'undefined') {
          const backupUser = sessionStorage.getItem('user_backup') || localStorage.getItem('user_data_backup')
          if (backupUser) {
            try {
              const userData = JSON.parse(backupUser)
              console.log('AuthContext: Restoring user from backup data')
              setUser(userData)
              localStorage.setItem('user', backupUser)
              const profile = userProfileManager.getUserProfile(userData.id, userData.name, userData.email)
              setUserProfile(profile)
            } catch (error) {
              console.warn('AuthContext: Failed to restore from backup:', error)
            }
          }
        }
      }
    }, 2000) // Check every 2 seconds for faster recovery

    return () => clearInterval(interval)
  }, [user])

  const login = (userData: User) => {
    console.log('AuthContext: Logging in user:', userData.email)
    setUser(userData)
    if (typeof window !== 'undefined') {
      // Store user data in multiple places for redundancy
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('session_timestamp', Date.now().toString())
      sessionStorage.setItem('user_backup', JSON.stringify(userData))
      
      // Also store in a more persistent way
      try {
        const userDataString = JSON.stringify(userData)
        localStorage.setItem('user_data_backup', userDataString)
        localStorage.setItem('user_id_backup', userData.id)
        localStorage.setItem('user_email_backup', userData.email)
      } catch (error) {
        console.warn('AuthContext: Failed to store backup user data:', error)
      }
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
      sessionStorage.removeItem('user_backup')
      localStorage.removeItem('user_data_backup')
      localStorage.removeItem('user_id_backup')
      localStorage.removeItem('user_email_backup')
    }
    console.log('AuthContext: Logout completed')
    // In a real app, you might also call a logout API endpoint
  }

  // Add session validation to prevent false logouts
  const validateSession = () => {
    if (typeof window === 'undefined') return true
    
    try {
      const savedUser = localStorage.getItem('user')
      const sessionTimestamp = localStorage.getItem('session_timestamp')
      
      if (!savedUser || !sessionTimestamp) {
        console.log('AuthContext: No session data found')
        return false
      }
      
      // Check if session is older than 24 hours (optional)
      const sessionAge = Date.now() - parseInt(sessionTimestamp)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      
      if (sessionAge > maxAge) {
        console.log('AuthContext: Session expired')
        logout()
        return false
      }
      
      console.log('AuthContext: Session is valid')
      return true
    } catch (error) {
      console.warn('AuthContext: Session validation failed:', error)
      return false
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
    <AuthContext.Provider value={{ user, userProfile, login, logout, isLoading, refreshProfile, clearAllUserData, debugUserData, validateSession }}>
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
