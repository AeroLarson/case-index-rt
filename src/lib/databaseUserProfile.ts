import { prisma } from './database'

export interface DatabaseUserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  plan: string
  createdAt: Date
  lastLogin: Date
  previousLogin?: Date
  clioTokens?: any
  tourCompleted: boolean
  savedCases: any[]
  recentSearches: any[]
  starredCases: any[]
  calendarEvents: any[]
  monthlyUsage: number
  maxMonthlyUsage: number
}

export class DatabaseUserProfileManager {
  async getUserProfile(userId: string, name: string, email: string): Promise<DatabaseUserProfile> {
    try {
      // Try to find existing user
      let user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          savedCases: true,
          recentSearches: true,
          starredCases: true,
          calendarEvents: true,
          usageTracking: {
            where: {
              month: new Date().toISOString().slice(0, 7) // Current month YYYY-MM
            }
          }
        }
      })

      if (user) {
        // Update last login
        await prisma.user.update({
          where: { id: userId },
          data: { 
            lastLogin: new Date(),
            previousLogin: user.lastLogin
          }
        })

        // Get current month usage
        const currentUsage = user.usageTracking[0] || { usageCount: 0, maxUsage: 1 }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          plan: user.plan,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          previousLogin: user.previousLogin,
          savedCases: user.savedCases,
          recentSearches: user.recentSearches,
          starredCases: user.starredCases,
          calendarEvents: user.calendarEvents,
          monthlyUsage: currentUsage.usageCount,
          maxMonthlyUsage: currentUsage.maxUsage
        }
      } else {
        // Create new user
        const newUser = await prisma.user.create({
          data: {
            id: userId,
            email,
            name,
            plan: 'free'
          },
          include: {
            savedCases: true,
            recentSearches: true,
            starredCases: true,
            calendarEvents: true,
            usageTracking: true
          }
        })

        // Create initial usage tracking for current month
        await prisma.usageTracking.create({
          data: {
            userId: userId,
            month: new Date().toISOString().slice(0, 7),
            usageCount: 0,
            maxUsage: 1,
            plan: 'free'
          }
        })

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          plan: newUser.plan,
          createdAt: newUser.createdAt,
          lastLogin: newUser.lastLogin,
          savedCases: [],
          recentSearches: [],
          starredCases: [],
          calendarEvents: [],
          monthlyUsage: 0,
          maxMonthlyUsage: 1
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      // Fallback to empty profile
      return {
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
        maxMonthlyUsage: 1
      }
    }
  }

  async addSavedCase(userId: string, caseData: any) {
    try {
      const savedCase = await prisma.savedCase.create({
        data: {
          userId,
          caseNumber: caseData.caseNumber,
          caseTitle: caseData.caseTitle,
          caseType: caseData.caseType,
          caseStatus: caseData.caseStatus,
          dateFiled: caseData.dateFiled,
          department: caseData.department,
          courtLocation: caseData.courtLocation,
          judicialOfficer: caseData.judicialOfficer,
          parties: caseData.parties,
          notes: caseData.notes,
          tags: caseData.tags || [],
          aiSummary: caseData.aiSummary,
          aiGeneratedAt: caseData.aiGeneratedAt
        }
      })
      return savedCase
    } catch (error) {
      console.error('Error adding saved case:', error)
      throw error
    }
  }

  async addRecentSearch(userId: string, searchData: any) {
    try {
      const recentSearch = await prisma.recentSearch.create({
        data: {
          userId,
          query: searchData.query,
          searchType: searchData.searchType,
          resultsCount: searchData.resultsCount
        }
      })
      return recentSearch
    } catch (error) {
      console.error('Error adding recent search:', error)
      throw error
    }
  }

  async addStarredCase(userId: string, caseId: string) {
    try {
      const starredCase = await prisma.starredCase.create({
        data: {
          userId,
          caseId
        }
      })
      return starredCase
    } catch (error) {
      console.error('Error adding starred case:', error)
      throw error
    }
  }

  async addCalendarEvent(userId: string, eventData: any) {
    try {
      const calendarEvent = await prisma.calendarEvent.create({
        data: {
          userId,
          title: eventData.title,
          date: eventData.date,
          time: eventData.time,
          type: eventData.type,
          caseNumber: eventData.caseNumber,
          location: eventData.location,
          description: eventData.description,
          duration: eventData.duration,
          priority: eventData.priority,
          status: eventData.status,
          virtualMeetingInfo: eventData.virtualMeetingInfo
        }
      })
      return calendarEvent
    } catch (error) {
      console.error('Error adding calendar event:', error)
      throw error
    }
  }

  async updateUsage(userId: string, increment: number = 1) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      await prisma.usageTracking.upsert({
        where: {
          userId_month: {
            userId,
            month: currentMonth
          }
        },
        update: {
          usageCount: {
            increment
          }
        },
        create: {
          userId,
          month: currentMonth,
          usageCount: increment,
          maxUsage: 1,
          plan: 'free'
        }
      })
    } catch (error) {
      console.error('Error updating usage:', error)
      throw error
    }
  }

  async updatePlan(userId: string, plan: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { plan }
      })

      // Update usage limits based on plan
      const maxUsage = plan === 'pro' ? 1000 : plan === 'team' ? 5000 : 1
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      await prisma.usageTracking.upsert({
        where: {
          userId_month: {
            userId,
            month: currentMonth
          }
        },
        update: {
          maxUsage,
          plan
        },
        create: {
          userId,
          month: currentMonth,
          usageCount: 0,
          maxUsage,
          plan
        }
      })
    } catch (error) {
      console.error('Error updating plan:', error)
      throw error
    }
  }

  async clearUserData(userId: string) {
    try {
      // Delete all user data from database
      await prisma.savedCase.deleteMany({ where: { userId } })
      await prisma.recentSearch.deleteMany({ where: { userId } })
      await prisma.starredCase.deleteMany({ where: { userId } })
      await prisma.calendarEvent.deleteMany({ where: { userId } })
      await prisma.notification.deleteMany({ where: { userId } })
      await prisma.usageTracking.deleteMany({ where: { userId } })
      await prisma.user.delete({ where: { id: userId } })
      
      console.log(`Cleared all data for user ${userId}`)
    } catch (error) {
      console.error('Error clearing user data:', error)
      throw error
    }
  }

  async toggleStarredCase(userId: string, caseId: string) {
    try {
      // Check if case is already starred
      const existingStar = await prisma.starredCase.findFirst({
        where: {
          userId,
          caseId: caseId
        }
      })

      if (existingStar) {
        // Remove star
        await prisma.starredCase.delete({
          where: { id: existingStar.id }
        })
        return false
      } else {
        // Add star
        await prisma.starredCase.create({
          data: {
            userId,
            caseId: caseId
          }
        })
        return true
      }
    } catch (error) {
      console.error('Error toggling starred case:', error)
      throw error
    }
  }

  async incrementMonthlyUsage(userId: string) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      
      // Get or create usage tracking for current month
      const usage = await prisma.usageTracking.upsert({
        where: {
          userId_month: {
            userId,
            month: currentMonth
          }
        },
        update: {
          usageCount: {
            increment: 1
          }
        },
        create: {
          userId,
          month: currentMonth,
          usageCount: 1,
          maxUsage: 1, // Default for free plan
          plan: 'free'
        }
      })

      return usage
    } catch (error) {
      console.error('Error incrementing monthly usage:', error)
      throw error
    }
  }

  async updateClioTokens(userId: string, tokens: any) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { clioTokens: tokens }
      })
    } catch (error) {
      console.error('Error updating Clio tokens:', error)
      throw error
    }
  }

  async getClioTokens(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { clioTokens: true }
      })
      return user?.clioTokens
    } catch (error) {
      console.error('Error getting Clio tokens:', error)
      throw error
    }
  }

  async markTourCompleted(userId: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { tourCompleted: true }
      })
    } catch (error) {
      console.error('Error marking tour as completed:', error)
      throw error
    }
  }

  async isTourCompleted(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tourCompleted: true }
      })
      return user?.tourCompleted || false
    } catch (error) {
      console.error('Error checking tour completion:', error)
      return false
    }
  }
}

export const databaseUserProfileManager = new DatabaseUserProfileManager()
