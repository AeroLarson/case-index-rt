'use client'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  savedCases: SavedCase[]
  recentSearches: RecentSearch[]
  starredCases: string[]
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
      savedCases: [],
      recentSearches: [],
      starredCases: [],
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
}

export const userProfileManager = new UserProfileManager()
