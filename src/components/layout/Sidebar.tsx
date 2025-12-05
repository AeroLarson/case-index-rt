'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { userProfileManager } from '@/lib/userProfile'

export default function Sidebar() {
  const { user, logout, userProfile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      const count = userProfileManager.getUnreadNotificationsCount(user.id)
      setUnreadCount(count)
      
      // Update count every 30 seconds
      const interval = setInterval(() => {
        const newCount = userProfileManager.getUnreadNotificationsCount(user.id)
        setUnreadCount(newCount)
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [user, userProfile])

  const handleLogout = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoggingOut) return // Prevent multiple logout calls
    
    // Add confirmation dialog to prevent accidental logouts
    const confirmed = window.confirm('Are you sure you want to log out of Case Index RT?')
    if (!confirmed) return
    
    setIsLoggingOut(true)
    logout()
    router.push('/')
    
    // Reset after a delay to prevent rapid clicking
    setTimeout(() => setIsLoggingOut(false), 2000)
  }, [logout, router, isLoggingOut])

  const isActive = (path: string) => {
    return pathname === path
  }

  const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set())

  const handleNavigation = useCallback((path: string) => {
    if (clickedButtons.has(path)) return // Prevent rapid clicking
    
    setClickedButtons(prev => new Set(prev).add(path))
    router.push(path)
    
    // Reset after navigation
    setTimeout(() => {
      setClickedButtons(prev => {
        const newSet = new Set(prev)
        newSet.delete(path)
        return newSet
      })
    }, 500)
  }, [router, clickedButtons])

  const getButtonClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline transition-colors border-none cursor-pointer w-full text-left hover-lift hover-glow"
    const activeClasses = "accent-gradient text-white"
    const inactiveClasses = "text-purple-300 hover:bg-purple-900/20"
    const disabledClasses = "opacity-50 cursor-not-allowed"
    
    const isDisabled = clickedButtons.has(path)
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses} ${isDisabled ? disabledClasses : ''}`
  }

  // Only show sidebar when user is logged in
  if (!user) {
    return null
  }

  return (
    <aside 
      id="sidebar-navigation"
      className="hidden lg:flex flex-col gap-6 h-screen fixed left-0 top-0 overflow-y-auto z-50"
      style={{
        width: '240px',
        background: 'linear-gradient(180deg,#1a0b2e 0%,#2d1b4e 100%)',
        padding: '24px 16px',
        zIndex: 50
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-4">
        <i className="fa-solid fa-gavel text-purple-400 text-2xl" />
        <span className="text-white text-lg font-semibold">Case Index RT</span>
      </div>

      {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => handleNavigation('/')}
              id="nav-dashboard"
              className={getButtonClasses('/')}
            >
              <i className="fa-solid fa-house text-base" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => handleNavigation('/search')}
              id="nav-search"
              className={getButtonClasses('/search')}
            >
              <i className="fa-solid fa-magnifying-glass text-base" />
              <span>Case Search</span>
            </button>
            <button 
              onClick={() => handleNavigation('/court-rules')}
              id="nav-court-rules"
              className={getButtonClasses('/court-rules')}
            >
              <i className="fa-solid fa-book text-base" />
              <span>Court Rules</span>
            </button>
            <button 
              onClick={() => handleNavigation('/analytics')}
              id="nav-analytics"
              className={getButtonClasses('/analytics')}
            >
              <i className="fa-solid fa-chart-line text-base" />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => handleNavigation('/notifications')}
              id="nav-notifications"
              className={getButtonClasses('/notifications')}
            >
              <div className="relative">
                <i className="fa-solid fa-bell text-base" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>Notifications</span>
            </button>
            <button 
              onClick={() => handleNavigation('/documents')}
              id="nav-documents"
              className={getButtonClasses('/documents')}
            >
              <i className="fa-solid fa-folder text-base" />
              <span>Documents</span>
            </button>
            <button 
              onClick={() => handleNavigation('/calendar')}
              id="nav-calendar"
              className={getButtonClasses('/calendar')}
            >
              <i className="fa-solid fa-calendar text-base" />
              <span>Calendar</span>
            </button>
            <button 
              onClick={() => handleNavigation('/billing')}
              id="nav-billing"
              className={getButtonClasses('/billing')}
            >
              <i className="fa-solid fa-credit-card text-base" />
              <span>Billing</span>
            </button>
            <button 
              onClick={() => handleNavigation('/settings')}
              id="nav-account"
              className={getButtonClasses('/settings')}
            >
              <i className="fa-solid fa-user text-base" />
              <span>Account</span>
            </button>
            <button 
              onClick={() => handleNavigation('/help')}
              id="nav-help"
              className={getButtonClasses('/help')}
            >
              <i className="fa-solid fa-circle-question text-base" />
              <span>Help Center</span>
            </button>
            <button 
              onClick={() => handleNavigation('/support')}
              id="nav-support"
              className={getButtonClasses('/support')}
            >
              <i className="fa-solid fa-headset text-base" />
              <span>Support</span>
            </button>
            
            {/* Admin and Tech Support Links - Only show for authorized users */}
            {user?.email === 'aero.larson@gmail.com' && (
              <>
                <div className="h-px bg-purple-400/20 my-4"></div>
                <button 
                  onClick={() => handleNavigation('/admin')}
                  id="nav-admin"
                  className={getButtonClasses('/admin')}
                >
                  <i className="fa-solid fa-crown text-base" />
                  <span>Admin Panel</span>
                </button>
                <button 
                  onClick={() => handleNavigation('/tech-support')}
                  id="nav-tech-support"
                  className={getButtonClasses('/tech-support')}
                >
                  <i className="fa-solid fa-headset text-base" />
                  <span>Tech Support</span>
                </button>
              </>
            )}
          </nav>

      {/* Bottom section - Different based on user state */}
      <div className="mt-auto pt-6 border-t border-purple-400/20">
        {user ? (
          // Logout button for authenticated users
          <button 
            onClick={handleLogout}
            onDoubleClick={(e) => e.preventDefault()}
            id="nav-logout"
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors border-none ${
              isLoggingOut 
                ? 'text-gray-500 cursor-not-allowed bg-gray-800/20' 
                : 'text-purple-300 hover:bg-purple-900/20 cursor-pointer bg-transparent'
            }`}
          >
            <i className="fa-solid fa-right-from-bracket text-base" />
            <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
          </button>
        ) : (
              // Sign In button for public users
              <button 
                onClick={() => router.push('/login')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600 text-white text-sm font-medium transition-colors hover:bg-purple-700 cursor-pointer border-none"
              >
                <i className="fa-solid fa-sign-in-alt text-base" />
                <span>Sign In</span>
              </button>
        )}
      </div>
    </aside>
  )
}
