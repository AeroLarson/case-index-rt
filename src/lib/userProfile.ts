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

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  savedCases: SavedCase[]
  recentSearches: RecentSearch[]
  starredCases: string[]
  calendarEvents: CalendarEvent[]
  monthlyUsage: number
  maxMonthlyUsage: number
  plan: 'free' | 'pro' | 'team'
  createdAt: string
  lastLogin: string
  previousLogin?: string
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
      savedCases: [
        {
          id: 'test-case-1',
          caseNumber: 'FL-2024-TEST001',
          caseTitle: 'Larson v. Test Defendant',
          caseType: 'Family Law',
          caseStatus: 'Active',
          dateFiled: '2024-01-15',
          department: 'Department 602',
          courtLocation: 'San Diego Superior Court',
          judicialOfficer: 'Hon. Test Judge',
          parties: {
            petitioner: 'Aero Larson',
            respondent: 'Test Defendant'
          },
          savedAt: new Date().toISOString(),
          notes: 'Test case for demonstration purposes',
          tags: ['test', 'family-law'],
          aiSummary: 'This is a test case involving family law matters between Aero Larson and Test Defendant. The case is currently active and involves standard family court proceedings.',
          aiGeneratedAt: new Date().toISOString()
        }
      ],
      recentSearches: [
        {
          id: 'search-1',
          query: 'FL-2024-TEST001',
          searchType: 'case',
          resultsCount: 1,
          searchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ],
      starredCases: ['test-case-1'],
      calendarEvents: [
        {
          id: 'event-1',
          title: 'Hearing - Larson v. Test Defendant',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
          time: '09:00',
          type: 'hearing',
          caseNumber: 'FL-2024-TEST001',
          location: 'San Diego Superior Court, Room 201',
          description: 'Request for order hearing',
          duration: 60,
          priority: 'high',
          status: 'scheduled',
          virtualMeetingInfo: 'Zoom ID: 123-456-7890, Passcode: 123456',
          createdAt: new Date().toISOString()
        }
      ],
      monthlyUsage: 1,
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
      const stored = localStorage.getItem(this.getStorageKey(userId))
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile
        // Save previous login time before updating
        profile.previousLogin = profile.lastLogin
        // Update last login to current time
        profile.lastLogin = new Date().toISOString()
        this.saveUserProfile(profile)
        return profile
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error)
    }

    // Return default profile for new users
    return this.getDefaultProfile(userId, name, email)
  }

  saveUserProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.getStorageKey(profile.id), JSON.stringify(profile))
    } catch (error) {
      console.warn('Failed to save user profile:', error)
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
    
    if (profile.monthlyUsage >= profile.maxMonthlyUsage) {
      return false // Usage limit reached
    }

    profile.monthlyUsage += 1
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

  clearUserData(userId: string): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.getStorageKey(userId))
    } catch (error) {
      console.warn('Failed to clear user data:', error)
    }
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
}

export const userProfileManager = new UserProfileManager()
