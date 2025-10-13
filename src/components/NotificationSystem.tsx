'use client'

import { useState, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface NotificationSystemProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export default function NotificationSystem({ notifications, onDismiss }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

function NotificationCard({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <i className="fa-solid fa-circle-check text-green-400 text-xl"></i>
      case 'error':
        return <i className="fa-solid fa-circle-xmark text-red-400 text-xl"></i>
      case 'warning':
        return <i className="fa-solid fa-triangle-exclamation text-yellow-400 text-xl"></i>
      case 'info':
        return <i className="fa-solid fa-circle-info text-blue-400 text-xl"></i>
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500/50'
      case 'error':
        return 'border-red-500/50'
      case 'warning':
        return 'border-yellow-500/50'
      case 'info':
        return 'border-blue-500/50'
    }
  }

  return (
    <div
      className={`apple-card p-4 border ${getBorderColor()} transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      style={{ animation: isExiting ? '' : 'slideInRight 0.3s ease-out' }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-1">{notification.title}</h4>
          <p className="text-gray-300 text-xs">{notification.message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>
    </div>
  )
}

// Hook to manage notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications((prev) => [...prev, { ...notification, id, duration: notification.duration || 5000 }])
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
  }
}

