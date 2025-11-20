'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { userProfileManager, Notification } from '@/lib/userProfile'

export default function NotificationsPage() {
  const { user, userProfile, isLoading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadNotifications()
    }
  }, [authLoading, user, userProfile, router])

  const loadNotifications = () => {
    if (!user) return
    
    setIsLoading(true)
    const profile = userProfileManager.getUserProfile(user.id, user.name || '', user.email || '')
    const userNotifications = userProfileManager.getNotifications(user.id)
    
    // Sort by date (newest first)
    const sortedNotifications = [...userNotifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    setNotifications(sortedNotifications)
    setIsLoading(false)
  }

  const markAsRead = (id: string) => {
    if (!user) return
    userProfileManager.markNotificationAsRead(user.id, id)
    refreshProfile()
    loadNotifications()
  }

  const markAllAsRead = () => {
    if (!user) return
    userProfileManager.markAllNotificationsAsRead(user.id)
    refreshProfile()
    loadNotifications()
  }

  const deleteNotification = (id: string) => {
    if (!user) return
    userProfileManager.deleteNotification(user.id, id)
    refreshProfile()
    loadNotifications()
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
      case 'hearing_scheduled':
      case 'hearing_changed':
        return 'fa-calendar-days'
      case 'new_filing':
        return 'fa-file-circle-plus'
      case 'case_update':
      case 'status_change':
        return 'fa-sync'
      case 'zoom_updated':
        return 'fa-video'
      case 'system':
        return 'fa-robot'
      default:
        return 'fa-bell'
    }
  }

  const getPriorityColor = (type: string) => {
    if (type === 'hearing_scheduled' || type === 'hearing_changed') return 'bg-green-500'
    if (type === 'new_filing') return 'bg-blue-500'
    if (type === 'status_change') return 'bg-yellow-500'
    if (type === 'zoom_updated') return 'bg-purple-500'
    return 'bg-gray-500'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'urgent') return notif.type === 'hearing_scheduled' || notif.type === 'hearing_changed'
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
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              filter === 'urgent' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Urgent ({notifications.filter(n => n.type === 'hearing_scheduled' || n.type === 'hearing_changed').length})
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
                    !notification.read ? 'ring-2 ring-blue-500/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${getPriorityColor(notification.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`fa-solid ${getNotificationIcon(notification.type)} text-white text-lg`}></i>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-lg">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-gray-400 text-sm">{formatTimestamp(notification.createdAt)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{notification.message}</p>
                      
                      {notification.caseNumber && (
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span className="text-blue-300 font-medium">{notification.caseNumber}</span>
                          {notification.caseTitle && (
                            <span className="text-gray-400">{notification.caseTitle}</span>
                          )}
                          {notification.metadata?.zoomId && (
                            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1">
                              <span className="text-purple-300 text-xs">
                                <i className="fa-solid fa-video mr-1"></i>
                                Zoom: {notification.metadata.zoomId}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {!notification.read && (
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
