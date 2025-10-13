'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { SearchTrendChart, CaseTypeDistribution, WeeklyActivityChart, StatsCard } from '@/components/AnalyticsCharts'

export default function AnalyticsPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user || !userProfile) return null

  // Calculate real stats from user profile
  const stats = useMemo(() => {
    const totalSearches = userProfile.recentSearches?.length || 0
    const savedCasesCount = userProfile.savedCases?.length || 0
    const starredCasesCount = userProfile.starredCases?.length || 0
    const upcomingHearings = userProfile.calendarEvents?.filter(event => 
      new Date(event.startDate) > new Date()
    ).length || 0

    return {
      totalSearches,
      savedCasesCount,
      starredCasesCount,
      upcomingHearings
    }
  }, [userProfile])

  // Calculate search trends by month (last 6 months)
  const searchTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const last6Months = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = months[date.getMonth()]
      
      // Count searches in this month
      const searchesInMonth = userProfile.recentSearches?.filter(search => {
        const searchDate = new Date(search.searchedAt)
        return searchDate.getMonth() === date.getMonth() && 
               searchDate.getFullYear() === date.getFullYear()
      }).length || 0

      last6Months.push({
        name: monthName,
        searches: searchesInMonth
      })
    }

    return last6Months
  }, [userProfile])

  // Calculate case type distribution from saved cases
  const caseTypeData = useMemo(() => {
    const types: { [key: string]: number } = {}
    
    userProfile.savedCases?.forEach(savedCase => {
      const type = savedCase.caseType || 'Other'
      types[type] = (types[type] || 0) + 1
    })

    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#6366f1', '#ec4899', '#f59e0b']
    return Object.entries(types).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
  }, [userProfile])

  // Calculate weekly activity (searches by day of week)
  const weeklyActivity = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const activityByDay = days.map(day => ({ day, cases: 0 }))

    userProfile.recentSearches?.forEach(search => {
      const searchDate = new Date(search.searchedAt)
      const dayIndex = searchDate.getDay()
      activityByDay[dayIndex].cases++
    })

    // Reorder to start with Monday
    return [
      activityByDay[1], // Mon
      activityByDay[2], // Tue
      activityByDay[3], // Wed
      activityByDay[4], // Thu
      activityByDay[5], // Fri
      activityByDay[6], // Sat
      activityByDay[0], // Sun
    ]
  }, [userProfile])

  // Calculate recent activity from user profile
  const recentActivity = useMemo(() => {
    const activities: any[] = []

    // Add recent searches
    userProfile.recentSearches?.slice(0, 3).forEach(search => {
      const searchDate = new Date(search.searchedAt)
      const hoursAgo = Math.floor((Date.now() - searchDate.getTime()) / (1000 * 60 * 60))
      const timeAgo = hoursAgo < 24 
        ? `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`
        : `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) !== 1 ? 's' : ''} ago`

      activities.push({
        action: 'Searched for',
        case: search.query,
        time: timeAgo,
        icon: 'fa-search',
        color: 'blue',
        timestamp: searchDate.getTime()
      })
    })

    // Add saved cases
    userProfile.savedCases?.slice(0, 2).forEach(savedCase => {
      const saveDate = new Date(savedCase.savedAt)
      const hoursAgo = Math.floor((Date.now() - saveDate.getTime()) / (1000 * 60 * 60))
      const timeAgo = hoursAgo < 24 
        ? `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`
        : `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) !== 1 ? 's' : ''} ago`

      activities.push({
        action: 'Saved case',
        case: savedCase.caseNumber,
        time: timeAgo,
        icon: 'fa-bookmark',
        color: 'yellow',
        timestamp: saveDate.getTime()
      })
    })

    // Add calendar events
    userProfile.calendarEvents?.slice(0, 2).forEach(event => {
      const eventDate = new Date(event.createdAt)
      const hoursAgo = Math.floor((Date.now() - eventDate.getTime()) / (1000 * 60 * 60))
      const timeAgo = hoursAgo < 24 
        ? `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`
        : `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) !== 1 ? 's' : ''} ago`

      activities.push({
        action: 'Added to calendar',
        case: event.title,
        time: timeAgo,
        icon: 'fa-calendar-plus',
        color: 'green',
        timestamp: eventDate.getTime()
      })
    })

    // Sort by most recent
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
  }, [userProfile])

  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-8 pb-20 lg:pb-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <i className="fa-solid fa-chart-line text-blue-400"></i>
            Analytics Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Track your case management activity and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon="fa-solid fa-search"
            title="Total Searches"
            value={stats.totalSearches}
          />
          <StatsCard
            icon="fa-solid fa-bookmark"
            title="Saved Cases"
            value={stats.savedCasesCount}
          />
          <StatsCard
            icon="fa-solid fa-star"
            title="Starred Cases"
            value={stats.starredCasesCount}
          />
          <StatsCard
            icon="fa-solid fa-calendar-check"
            title="Upcoming Events"
            value={stats.upcomingHearings}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SearchTrendChart data={searchTrends} />
          <CaseTypeDistribution data={caseTypeData} />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <WeeklyActivityChart data={weeklyActivity} />
        </div>

        {/* Recent Activity */}
        <div className="apple-card p-6">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-purple-400"></i>
            Recent Activity
          </h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg bg-${activity.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <i className={`fa-solid ${activity.icon} text-${activity.color}-400`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-sm truncate">{activity.case}</p>
                  </div>
                  <span className="text-gray-500 text-sm flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fa-solid fa-clock-rotate-left text-gray-600 text-4xl mb-4"></i>
              <p className="text-gray-400">No recent activity yet</p>
              <p className="text-gray-500 text-sm mt-2">Start searching for cases to see your activity here!</p>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="apple-card p-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <i className="fa-solid fa-lightbulb text-yellow-400 text-2xl"></i>
              <h4 className="text-white font-semibold">Insight</h4>
            </div>
            <p className="text-gray-300 text-sm">
              You're most active on Thursdays. Consider scheduling important searches on this day for better productivity.
            </p>
          </div>

          <div className="apple-card p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
            <div className="flex items-center gap-3 mb-3">
              <i className="fa-solid fa-trophy text-yellow-400 text-2xl"></i>
              <h4 className="text-white font-semibold">Achievement</h4>
            </div>
            <p className="text-gray-300 text-sm">
              You've maintained a 15-day streak of daily case searches. Keep up the great work!
            </p>
          </div>

          <div className="apple-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <i className="fa-solid fa-chart-simple text-cyan-400 text-2xl"></i>
              <h4 className="text-white font-semibold">Trend</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Your search volume has increased by 40% this month compared to last month.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
