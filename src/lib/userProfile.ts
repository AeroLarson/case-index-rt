'use client'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'hearing' | 'deadline' | 'meeting' | 'deposition' | 'trial'
  caseNumber: string
  location?: string
  description: string
  duration: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'scheduled' | 'completed' | 'cancelled'
  virtualMeetingInfo?: string
  createdAt: string
}

export interface Notification {
  id: string
  type: 'case_update' | 'new_filing' | 'hearing_scheduled' | 'hearing_changed' | 'zoom_updated' | 'status_change'
  title: string
  message: string
  caseNumber?: string
  caseTitle?: string
  read: boolean
  createdAt: string
  actionUrl?: string
  metadata?: {
    eventType?: string
    date?: string
    zoomId?: string
    passcode?: string
  }
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  savedCases: SavedCase[]
  recentSearches: RecentSearch[]
  starredCases: string[]
  calendarEvents: CalendarEvent[]
  notifications: Notification[]
  supportTickets?: any[]
  monthlyUsage: number
  maxMonthlyUsage: number
  plan: 'free' | 'pro' | 'team'
  createdAt: string
  lastLogin: string
  previousLogin?: string
  lastUsageReset?: string // Track when monthly usage was last reset
  stripeCustomerId?: string // Stripe customer ID for subscription management
}

export interface SavedCase {
  id: string
  caseNumber: string
  caseTitle: string
  caseType: string
  caseStatus: string
  dateFiled: string
  department: string
  courtLocation: string
  judicialOfficer: string
  parties: {
    petitioner: string
    respondent: string
    petitionerAttorney?: string
    respondentAttorney?: string
  }
  savedAt: string
  notes?: string
  tags?: string[]
  aiSummary?: string
  aiGeneratedAt?: string
}

export interface RecentSearch {
  id: string
  query: string
  searchType: 'case' | 'party' | 'attorney'
  resultsCount: number
  searchedAt: string
}

export interface UserProfileData {
  savedCases: SavedCase[]
  recentSearches: RecentSearch[]
  starredCases: string[]
  monthlyUsage: number
  maxMonthlyUsage: number
  plan: 'free' | 'pro' | 'team'
}

class UserProfileManager {
  private getStorageKey(userId: string): string {
    return `user_profile_${userId}`
  }

  private getDefaultProfile(userId: string, name: string, email: string): UserProfile {
    return {
      id: userId,
      name,
      email,
      savedCases: [],
      recentSearches: [],
      starredCases: [],
      calendarEvents: [],
      notifications: [],
      monthlyUsage: 0,
      maxMonthlyUsage: 1, // Free plan limit - only 1 case per month
      plan: 'free',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  }

  getUserProfile(userId: string, name: string, email: string): UserProfile {
    if (typeof window === 'undefined') {
      return this.getDefaultProfile(userId, name, email)
    }

    try {
      const storageKey = this.getStorageKey(userId)
      console.log(`Loading profile for user ${userId} (${name}) with storage key: ${storageKey}`)
      
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile
        console.log(`Found existing profile for user ${userId} with ${profile.savedCases?.length || 0} saved cases`)
        
        // Ensure all arrays are initialized for existing profiles
        if (!profile.savedCases) profile.savedCases = []
        if (!profile.recentSearches) profile.recentSearches = []
        if (!profile.starredCases) profile.starredCases = []
        if (!profile.calendarEvents) profile.calendarEvents = []
        if (!profile.notifications) profile.notifications = []
        
        // Reset monthly usage if we're in a new month
        if (profile.plan === 'free' && profile.monthlyUsage > 0) {
          const lastUsageReset = profile.lastUsageReset ? new Date(profile.lastUsageReset) : new Date(profile.createdAt)
          const now = new Date()
          
          // Check if we've moved to a new month
          if (lastUsageReset.getMonth() !== now.getMonth() || 
              lastUsageReset.getFullYear() !== now.getFullYear()) {
            profile.monthlyUsage = 0
            profile.lastUsageReset = new Date().toISOString()
            console.log(`Monthly usage reset for user ${userId} - new month detected`)
          }
        }
        
        // Save previous login time before updating
        profile.previousLogin = profile.lastLogin
        // Update last login to current time
        profile.lastLogin = new Date().toISOString()
        
        // Initialize lastUsageReset if not set
        if (!profile.lastUsageReset && profile.monthlyUsage === 0) {
          profile.lastUsageReset = new Date().toISOString()
        }
        
        this.saveUserProfile(profile)
        return profile
      } else {
        console.log(`No existing profile found for user ${userId}, creating new profile`)
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error)
    }

    // Return default profile for new users
    const newProfile = this.getDefaultProfile(userId, name, email)
    console.log(`Creating new empty profile for user ${userId}`)
    return newProfile
  }

  saveUserProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return

    try {
      const storageKey = this.getStorageKey(profile.id)
      console.log(`Saving profile for user ${profile.id} with storage key: ${storageKey}`)
      localStorage.setItem(storageKey, JSON.stringify(profile))
    } catch (error) {
      console.warn('Failed to save user profile:', error)
    }
  }

  // Clear all user data (useful for testing)
  clearAllUserData(): void {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage)
      const userProfileKeys = keys.filter(key => key.startsWith('user_profile_'))
      console.log(`Clearing ${userProfileKeys.length} user profiles from localStorage`)
      
      userProfileKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log(`Removed profile: ${key}`)
      })
    } catch (error) {
      console.error('Failed to clear user data:', error)
    }
  }

  // Get all user storage keys for debugging
  getAllUserStorageKeys(): string[] {
    if (typeof window === 'undefined') return []

    try {
      const keys = Object.keys(localStorage)
      return keys.filter(key => key.startsWith('user_profile_'))
    } catch (error) {
      console.error('Failed to get storage keys:', error)
      return []
    }
  }

  // Clear specific user data
  clearUserData(userId: string): void {
    if (typeof window === 'undefined') return

    try {
      const storageKey = this.getStorageKey(userId)
      localStorage.removeItem(storageKey)
      console.log(`Cleared data for user ${userId} with storage key: ${storageKey}`)
    } catch (error) {
      console.error('Failed to clear user data:', error)
    }
  }

  addSavedCase(userId: string, caseData: Omit<SavedCase, 'id' | 'savedAt'>): SavedCase {
    const profile = this.getUserProfile(userId, '', '')
    const newCase: SavedCase = {
      ...caseData,
      id: `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date().toISOString()
    }

    profile.savedCases.unshift(newCase)
    this.saveUserProfile(profile)
    return newCase
  }

  removeSavedCase(userId: string, caseId: string): void {
    const profile = this.getUserProfile(userId, '', '')
    profile.savedCases = profile.savedCases.filter(c => c.id !== caseId)
    this.saveUserProfile(profile)
  }

  addRecentSearch(userId: string, searchData: Omit<RecentSearch, 'id' | 'searchedAt'>): RecentSearch {
    const profile = this.getUserProfile(userId, '', '')
    const newSearch: RecentSearch = {
      ...searchData,
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      searchedAt: new Date().toISOString()
    }

    // Keep only last 10 searches
    profile.recentSearches.unshift(newSearch)
    if (profile.recentSearches.length > 10) {
      profile.recentSearches = profile.recentSearches.slice(0, 10)
    }

    this.saveUserProfile(profile)
    return newSearch
  }

  toggleStarredCase(userId: string, caseId: string): boolean {
    const profile = this.getUserProfile(userId, '', '')
    
    // Ensure starredCases array exists
    if (!profile.starredCases) {
      profile.starredCases = []
    }
    
    const isStarred = profile.starredCases.includes(caseId)
    
    if (isStarred) {
      profile.starredCases = profile.starredCases.filter(id => id !== caseId)
    } else {
      profile.starredCases.push(caseId)
    }

    this.saveUserProfile(profile)
    return !isStarred
  }

  incrementMonthlyUsage(userId: string): boolean {
    const profile = this.getUserProfile(userId, '', '')
    
    // Reset monthly usage if we're in a new month (for free plan users)
    if (profile.plan === 'free' && profile.monthlyUsage > 0) {
      const lastUsageReset = profile.lastUsageReset ? new Date(profile.lastUsageReset) : new Date(profile.createdAt)
      const now = new Date()
      
      if (lastUsageReset.getMonth() !== now.getMonth() || 
          lastUsageReset.getFullYear() !== now.getFullYear()) {
        profile.monthlyUsage = 0
        profile.lastUsageReset = new Date().toISOString()
      }
    }
    
    if (profile.monthlyUsage >= profile.maxMonthlyUsage) {
      return false // Usage limit reached
    }

    profile.monthlyUsage += 1
    
    // Set lastUsageReset on first usage of the month
    if (!profile.lastUsageReset) {
      profile.lastUsageReset = new Date().toISOString()
    }
    
    this.saveUserProfile(profile)
    return true
  }

  resetMonthlyUsage(userId: string): void {
    const profile = this.getUserProfile(userId, '', '')
    profile.monthlyUsage = 0
    this.saveUserProfile(profile)
  }

  updatePlan(userId: string, plan: 'free' | 'pro' | 'team'): void {
    const profile = this.getUserProfile(userId, '', '')
    profile.plan = plan
    
    // Update usage limits based on plan
    switch (plan) {
      case 'free':
        profile.maxMonthlyUsage = 1
        break
      case 'pro':
        profile.maxMonthlyUsage = 999999 // Unlimited for Pro users
        break
      case 'team':
        profile.maxMonthlyUsage = 999999 // Unlimited for Team users
        break
    }

    this.saveUserProfile(profile)
  }


  addCalendarEvent(userId: string, eventData: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent {
    const profile = this.getUserProfile(userId, '', '')
    
    // Initialize calendarEvents if it doesn't exist (for existing profiles)
    if (!profile.calendarEvents) {
      profile.calendarEvents = []
    }
    
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }

    // Check if event already exists for this case
    const existingEventIndex = profile.calendarEvents.findIndex(
      e => e.caseNumber === eventData.caseNumber && e.type === eventData.type
    )

    if (existingEventIndex >= 0) {
      // Update existing event
      profile.calendarEvents[existingEventIndex] = newEvent
    } else {
      // Add new event
      profile.calendarEvents.unshift(newEvent)
    }

    this.saveUserProfile(profile)
    return newEvent
  }

  removeCalendarEvent(userId: string, eventId: string): void {
    const profile = this.getUserProfile(userId, '', '')
    profile.calendarEvents = profile.calendarEvents.filter(e => e.id !== eventId)
    this.saveUserProfile(profile)
  }

  getCalendarEvents(userId: string): CalendarEvent[] {
    const profile = this.getUserProfile(userId, '', '')
    return profile.calendarEvents || []
  }

  // Clio integration methods
  getClioTokens(userId: string): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      const storageKey = `clio_tokens_${userId}`
      return localStorage.getItem(storageKey)
    } catch (error) {
      console.warn('Failed to get Clio tokens:', error)
      return null
    }
  }

  updateClioTokens(userId: string, tokens: any): void {
    if (typeof window === 'undefined') return
    
    try {
      const storageKey = `clio_tokens_${userId}`
      if (tokens) {
        localStorage.setItem(storageKey, JSON.stringify(tokens))
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch (error) {
      console.warn('Failed to update Clio tokens:', error)
    }
  }

  // Payment records methods
  getPaymentRecords(userId: string): any[] {
    if (typeof window === 'undefined') return []
    
    try {
      const storageKey = `payment_records_${userId}`
      const records = localStorage.getItem(storageKey)
      return records ? JSON.parse(records) : []
    } catch (error) {
      console.warn('Failed to get payment records:', error)
      return []
    }
  }

  addPaymentRecord(userId: string, record: any): void {
    if (typeof window === 'undefined') return
    
    try {
      const storageKey = `payment_records_${userId}`
      const existingRecords = this.getPaymentRecords(userId)
      existingRecords.push(record)
      localStorage.setItem(storageKey, JSON.stringify(existingRecords))
    } catch (error) {
      console.warn('Failed to add payment record:', error)
    }
  }

  // Notification methods
  addNotification(userId: string, notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const profile = this.getUserProfile(userId, '', '')
    
    // Initialize notifications if it doesn't exist
    if (!profile.notifications) {
      profile.notifications = []
    }
    
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    profile.notifications.unshift(newNotification)
    
    // Keep only last 100 notifications
    if (profile.notifications.length > 100) {
      profile.notifications = profile.notifications.slice(0, 100)
    }
    
    this.saveUserProfile(profile)
    return newNotification
  }

  markNotificationAsRead(userId: string, notificationId: string): void {
    const profile = this.getUserProfile(userId, '', '')
    if (!profile.notifications) return
    
    const notification = profile.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveUserProfile(profile)
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    const profile = this.getUserProfile(userId, '', '')
    if (!profile.notifications) return
    
    profile.notifications.forEach(n => n.read = true)
    this.saveUserProfile(profile)
  }

  getUnreadNotificationsCount(userId: string): number {
    const profile = this.getUserProfile(userId, '', '')
    if (!profile.notifications) return 0
    return profile.notifications.filter(n => !n.read).length
  }

  getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const profile = this.getUserProfile(userId, '', '')
    if (!profile.notifications) return []
    return unreadOnly ? profile.notifications.filter(n => !n.read) : profile.notifications
  }

  deleteNotification(userId: string, notificationId: string): void {
    const profile = this.getUserProfile(userId, '', '')
    if (!profile.notifications) return
    
    profile.notifications = profile.notifications.filter(n => n.id !== notificationId)
    this.saveUserProfile(profile)
  }

  // Support tickets methods
  addSupportTicket(userId: string, ticket: any): void {
    const profile = this.getUserProfile(userId, '', '')
    
    if (!profile.supportTickets) {
      profile.supportTickets = []
    }
    
    profile.supportTickets.push(ticket)
    this.saveUserProfile(profile)
  }

  // Update user profile method
  updateUserProfile(userId: string, updates: Partial<UserProfile>): void {
    const profile = this.getUserProfile(userId, '', '')
    const updatedProfile = { ...profile, ...updates }
    this.saveUserProfile(updatedProfile)
  }
}

export const userProfileManager = new UserProfileManager()
