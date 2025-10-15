'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'hearing' | 'deadline' | 'document' | 'case_update' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  caseNumber?: string
  actionUrl?: string
}

export default function NotificationsPage() {
  const { user, userProfile, isLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Load real notifications based on user data
    const loadNotifications = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const realNotifications: Notification[] = []
      
      // Generate notifications from user's saved cases
      const savedCases = userProfile?.savedCases || []
      const now = new Date()
      
      savedCases.forEach(case_ => {
        // Check if case has upcoming hearings (within 24 hours = urgent)
        const hearingDate = new Date(case_.dateFiled)
        const timeDiff = hearingDate.getTime() - now.getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)
        
        if (hoursDiff <= 24 && hoursDiff > 0) {
          realNotifications.push({
            id: `urgent_${case_.id}`,
            type: 'hearing',
            title: 'URGENT: Upcoming Hearing',
            message: `Hearing for ${case_.caseTitle} scheduled within 24 hours`,
            timestamp: 'Just now',
            isRead: false,
            priority: 'urgent',
            caseNumber: case_.caseNumber,
            actionUrl: '/search'
          })
        }
        
        // Add case update notifications
        if (case_.caseStatus === 'Active') {
          realNotifications.push({
            id: `update_${case_.id}`,
            type: 'case_update',
            title: 'Case Status Update',
            message: `${case_.caseTitle} status: ${case_.caseStatus}`,
            timestamp: new Date(case_.savedAt).toLocaleDateString(),
            isRead: false,
            priority: 'medium',
            caseNumber: case_.caseNumber,
            actionUrl: '/search'
          })
        }
      })
      
      // Add search limit notifications for free users
      if (userProfile?.plan === 'free' && userProfile?.monthlyUsage >= userProfile?.maxMonthlyUsage) {
        realNotifications.push({
          id: 'limit_reached',
          type: 'system',
          title: 'Search Limit Reached',
          message: 'You have reached your monthly search limit. Upgrade to Pro for unlimited searches.',
          timestamp: 'Just now',
          isRead: false,
          priority: 'high',
          actionUrl: '/billing'
        })
      }
      
      // If no real notifications, show empty state
      if (realNotifications.length === 0) {
        realNotifications.push({
          id: 'no_notifications',
          type: 'system',
          title: 'No Notifications',
          message: 'You have no notifications at this time. Start searching for cases to receive updates.',
          timestamp: 'Just now',
          isRead: true,
          priority: 'low',
          actionUrl: '/search'
        })
      }
      
      setNotifications(realNotifications)
      setIsLoading(false)
    }

    loadNotifications()
  }, [user, userProfile, router])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    // Navigate based on notification type and case number
    if (notification.caseNumber) {
      // Navigate to search page with the case number pre-filled
      router.push(`/search?case=${encodeURIComponent(notification.caseNumber)}`)
    } else if (notification.actionUrl) {
      // Navigate to specific action URL
      router.push(notification.actionUrl)
    } else {
      // Default navigation based on type
      switch (notification.type) {
        case 'hearing':
          router.push('/calendar')
          break
        case 'document':
          router.push('/documents')
          break
        case 'case_update':
          router.push('/search')
          break
        default:
          router.push('/search')
      }
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hearing':
        return 'fa-gavel'
      case 'deadline':
        return 'fa-clock'
      case 'document':
        return 'fa-file'
      case 'case_update':
        return 'fa-sync'
      case 'system':
        return 'fa-robot'
      default:
        return 'fa-bell'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead
    if (filter === 'urgent') return notif.priority === 'urgent'
    return true
  })

  if (!user) {
    return null
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">Notifications</h1>
            <p className="text-gray-300 text-lg">Stay updated with case activities and deadlines</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={markAllAsRead}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
            >
              <i className="fa-solid fa-check-double mr-2"></i>
              Mark All Read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              filter === 'unread' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Unread ({notifications.filter(n => !n.isRead).length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              filter === 'urgent' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Urgent ({notifications.filter(n => n.priority === 'urgent').length})
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="apple-card p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="apple-card p-12 text-center">
                <i className="fa-solid fa-bell-slash text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-white text-xl font-semibold mb-2">No notifications</h3>
                <p className="text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`apple-card p-6 hover-lift transition-all duration-200 cursor-pointer ${
                    !notification.isRead ? 'ring-2 ring-blue-500/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${getPriorityColor(notification.priority)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`fa-solid ${getNotificationIcon(notification.type)} text-white text-lg`}></i>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-lg">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-gray-400 text-sm">{notification.timestamp}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{notification.message}</p>
                      
                      {notification.caseNumber && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-300 font-medium">{notification.caseNumber}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {notification.priority.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
