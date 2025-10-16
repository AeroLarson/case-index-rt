'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { userProfileManager } from '@/lib/userProfile'
import { PaymentTracker } from '@/lib/paymentTracker'

// Admin email - only this email can access admin panel
const ADMIN_EMAIL = 'aero.larson@gmail.com'

export default function AdminPage() {
  const { user, userProfile, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalSearches: 0,
    totalSavedCases: 0,
    freeUsers: 0,
    proUsers: 0,
    teamUsers: 0,
    enterpriseUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    averageSearchesPerUser: 0,
    topSearchedCases: [] as any[],
    userGrowth: [] as any[],
    planDistribution: [] as any[]
  })
  const [paymentStats, setPaymentStats] = useState({
    totalPayments: 0,
    completedPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    failedPayments: 0,
    proSubscriptions: 0,
    teamSubscriptions: 0,
    enterpriseSubscriptions: 0,
    recentPayments: [] as any[],
    revenueByMonth: [] as any[],
    conversionRate: 0,
    churnRate: 0
  })
  const [userList, setUserList] = useState([] as any[])
  const [systemHealth, setSystemHealth] = useState({
    apiStatus: 'healthy',
    databaseStatus: 'connected',
    stripeStatus: 'active',
    lastBackup: new Date().toISOString(),
    uptime: '99.9%'
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Check if user is authorized admin
    if (user.email === ADMIN_EMAIL) {
      setIsAuthorized(true)
      loadAdminStats()
    } else {
      // Redirect unauthorized users
      router.push('/')
      return
    }

    setIsLoading(false)
    }
  }, [authLoading, user, router])

  const loadAdminStats = () => {
    // Load comprehensive real statistics from localStorage
    if (typeof window === 'undefined') return
    
    let totalUsers = 0
    let totalSearches = 0
    let totalSavedCases = 0
    let freeUsers = 0
    let proUsers = 0
    let teamUsers = 0
    let enterpriseUsers = 0
    let activeUsers = 0
    let newUsersThisMonth = 0
    const allSearches: any[] = []
    const userListData: any[] = []
    
    // Calculate date ranges
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thisMonth = new Date()
    thisMonth.setDate(1)
    
    // Count all user profiles in localStorage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('user_profile_')) {
        try {
          const profile = JSON.parse(localStorage.getItem(key) || '{}')
          totalUsers++
          totalSearches += profile.recentSearches?.length || 0
          totalSavedCases += profile.savedCases?.length || 0
          
          // Collect all searches for analytics
          if (profile.recentSearches) {
            allSearches.push(...profile.recentSearches)
          }
          
          // Check if user is active (logged in within 30 days)
          const lastLogin = profile.previousLogin ? new Date(profile.previousLogin) : new Date(0)
          if (lastLogin > thirtyDaysAgo) {
            activeUsers++
          }
          
          // Check if user joined this month
          const joinDate = profile.joinDate ? new Date(profile.joinDate) : new Date(0)
          if (joinDate >= thisMonth) {
            newUsersThisMonth++
          }
          
          // Add to user list for management
          userListData.push({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            plan: profile.plan,
            joinDate: profile.joinDate,
            lastLogin: profile.previousLogin,
            totalSearches: profile.totalSearches || 0,
            savedCases: profile.savedCases?.length || 0,
            monthlyUsage: profile.monthlyUsage || 0
          })
          
          switch (profile.plan) {
            case 'free':
              freeUsers++
              break
            case 'pro':
              proUsers++
              break
            case 'team':
              teamUsers++
              break
            case 'enterprise':
              enterpriseUsers++
              break
          }
        } catch (error) {
          console.warn('Failed to parse user profile:', key, error)
        }
      }
    })
    
    // Calculate top searched cases
    const searchCounts = allSearches.reduce((acc: any, search: any) => {
      acc[search.query] = (acc[search.query] || 0) + 1
      return acc
    }, {})
    const topSearchedCases = Object.entries(searchCounts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }))
    
    // Generate user growth data (last 12 months)
    const userGrowth = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const usersInMonth = userListData.filter(user => {
        const joinDate = user.joinDate ? new Date(user.joinDate) : new Date(0)
        return joinDate >= monthStart && joinDate <= monthEnd
      }).length
      
      userGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: usersInMonth
      })
    }
    
    // Plan distribution
    const planDistribution = [
      { plan: 'Free', count: freeUsers, percentage: totalUsers > 0 ? Math.round((freeUsers / totalUsers) * 100) : 0 },
      { plan: 'Pro', count: proUsers, percentage: totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0 },
      { plan: 'Team', count: teamUsers, percentage: totalUsers > 0 ? Math.round((teamUsers / totalUsers) * 100) : 0 },
      { plan: 'Enterprise', count: enterpriseUsers, percentage: totalUsers > 0 ? Math.round((enterpriseUsers / totalUsers) * 100) : 0 }
    ]
    
    setAdminStats({
      totalUsers,
      totalSearches,
      totalSavedCases,
      freeUsers,
      proUsers,
      teamUsers,
      enterpriseUsers,
      activeUsers,
      newUsersThisMonth,
      averageSearchesPerUser: totalUsers > 0 ? Math.round(totalSearches / totalUsers) : 0,
      topSearchedCases,
      userGrowth,
      planDistribution
    })
    
    // Load comprehensive payment statistics
    const paymentData = PaymentTracker.getPaymentStats()
    
    // Calculate monthly revenue
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyRevenue = paymentData.recentPayments
      .filter((payment: any) => {
        const paymentDate = new Date(payment.timestamp)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      })
      .reduce((sum: number, payment: any) => sum + payment.amount, 0)
    
    // Calculate conversion rate
    const conversionRate = totalUsers > 0 ? Math.round(((proUsers + teamUsers + enterpriseUsers) / totalUsers) * 100) : 0
    
    // Generate revenue by month data
    const revenueByMonth = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const revenueInMonth = paymentData.recentPayments
        .filter((payment: any) => {
          const paymentDate = new Date(payment.timestamp)
          return paymentDate >= monthStart && paymentDate <= monthEnd && payment.status === 'active'
        })
        .reduce((sum: number, payment: any) => sum + payment.amount, 0)
      
      revenueByMonth.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: revenueInMonth
      })
    }
    
    setPaymentStats({
      ...paymentData,
      monthlyRevenue,
      conversionRate,
      churnRate: 0, // Would need historical data to calculate
      revenueByMonth
    })
    
    // Sort user list by last login
    setUserList(userListData.sort((a, b) => 
      new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime()
    ))
  }

  const handleResetUserData = (userId: string) => {
    if (confirm('Are you sure you want to reset this user\'s data? This action cannot be undone.')) {
      userProfileManager.clearUserData(userId)
      alert('User data cleared successfully')
    }
  }

  const handleResetAllData = () => {
    if (confirm('Are you sure you want to reset ALL user data? This action cannot be undone.')) {
      // Clear all user profiles from localStorage
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('user_profile_')) {
            localStorage.removeItem(key)
          }
        })
      }
      alert('All user data cleared successfully')
    }
  }

  if (isLoading) {
    return (
      <main 
        className="min-h-screen animated-aura"
        style={{
          background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
          padding: '40px 24px'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white text-xl">Loading admin panel...</div>
          </div>
        </div>
      </main>
    )
  }

  if (!isAuthorized) {
    return (
      <main 
        className="min-h-screen animated-aura"
        style={{
          background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
          padding: '40px 24px'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-white text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-300 text-lg">You don't have permission to access this page.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '40px 24px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-4">Admin Panel</h1>
          <p className="text-gray-300 text-lg">System administration and user management</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="apple-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-users text-white text-xl" />
              </div>
              <span className="text-white text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</span>
            </div>
            <p className="text-gray-300 text-sm">Total Users</p>
          </div>

          <div className="apple-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-search text-white text-xl" />
              </div>
              <span className="text-white text-2xl font-bold">{adminStats.totalSearches.toLocaleString()}</span>
            </div>
            <p className="text-gray-300 text-sm">Total Searches</p>
          </div>

          <div className="apple-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-folder text-white text-xl" />
              </div>
              <span className="text-white text-2xl font-bold">{adminStats.totalSavedCases.toLocaleString()}</span>
            </div>
            <p className="text-gray-300 text-sm">Saved Cases</p>
          </div>
        </div>

        {/* User Plan Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="apple-card p-8">
            <h3 className="text-white text-xl font-semibold mb-6">User Plan Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-white">Free Plan</span>
                </div>
                <span className="text-white font-bold">{adminStats.freeUsers}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-white">Professional</span>
                </div>
                <span className="text-white font-bold">{adminStats.proUsers}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-white">Team</span>
                </div>
                <span className="text-white font-bold">{adminStats.teamUsers}</span>
              </div>
            </div>
          </div>

          <div className="apple-card p-8">
            <h3 className="text-white text-xl font-semibold mb-6">Payment Statistics</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-white text-2xl font-bold">${paymentStats.totalRevenue.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-white text-2xl font-bold">{paymentStats.completedPayments}</div>
                <div className="text-gray-300 text-sm">Completed Payments</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-white text-2xl font-bold">{paymentStats.pendingPayments}</div>
                <div className="text-gray-300 text-sm">Pending</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="text-white text-2xl font-bold">{paymentStats.failedPayments}</div>
                <div className="text-gray-300 text-sm">Failed</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white">Pro Subscriptions</span>
                <span className="text-blue-400 font-bold">{paymentStats.proSubscriptions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white">Team Subscriptions</span>
                <span className="text-purple-400 font-bold">{paymentStats.teamSubscriptions}</span>
              </div>
            </div>
          </div>

          <div className="apple-card p-8">
            <h3 className="text-white text-xl font-semibold mb-6">Recent Payments</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {paymentStats.recentPayments.length > 0 ? (
                paymentStats.recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <div className="text-white font-medium">{payment.userName}</div>
                      <div className="text-gray-400 text-sm">{payment.userEmail}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">${payment.amount}</div>
                      <div className="text-gray-400 text-sm capitalize">{payment.planId}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">No payments yet</div>
              )}
            </div>
          </div>

          <div className="apple-card p-8">
            <h3 className="text-white text-xl font-semibold mb-6">System Management</h3>
            <div className="space-y-4">
              <button
                onClick={() => handleResetAllData()}
                className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 hover:bg-red-500/20 transition-colors"
              >
                <i className="fa-solid fa-trash mr-2"></i>
                Reset All User Data
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-300 hover:bg-blue-500/20 transition-colors"
              >
                <i className="fa-solid fa-refresh mr-2"></i>
                Refresh System
              </button>
              <button
                onClick={() => router.push('/data-mining')}
                className="w-full p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-300 hover:bg-green-500/20 transition-colors"
              >
                <i className="fa-solid fa-database mr-2"></i>
                Data Mining Tools
              </button>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="apple-card p-8">
          <h3 className="text-white text-xl font-semibold mb-6">API Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm mb-2">San Diego Court API Key</label>
              <input
                type="password"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter API key..."
                defaultValue="your-internal-api-key"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Google OAuth Client ID</label>
              <input
                type="text"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter client ID..."
                defaultValue={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id'}
              />
            </div>
          </div>
          <div className="mt-6">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
              Save Configuration
            </button>
          </div>
        </div>

        {/* Current User Info */}
        <div className="apple-card p-8 mt-8">
          <h3 className="text-white text-xl font-semibold mb-6">Current Admin User</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <i className="fa-solid fa-user-shield text-white text-xl" />
            </div>
            <div>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-green-400 text-sm">Admin Access Granted</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}