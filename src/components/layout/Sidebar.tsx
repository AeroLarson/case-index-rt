'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const getButtonClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline transition-colors border-none cursor-pointer w-full text-left hover-lift hover-glow"
    const activeClasses = "accent-gradient text-white"
    const inactiveClasses = "text-purple-300 hover:bg-purple-900/20"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
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
              onClick={() => router.push('/')}
              id="nav-dashboard"
              className={getButtonClasses('/')}
            >
              <i className="fa-solid fa-house text-base" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => router.push('/search')}
              id="nav-search"
              className={getButtonClasses('/search')}
            >
              <i className="fa-solid fa-magnifying-glass text-base" />
              <span>Case Search</span>
            </button>
            <button 
              onClick={() => router.push('/analytics')}
              id="nav-analytics"
              className={getButtonClasses('/analytics')}
            >
              <i className="fa-solid fa-chart-line text-base" />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => router.push('/notifications')}
              id="nav-notifications"
              className={getButtonClasses('/notifications')}
            >
              <i className="fa-solid fa-bell text-base" />
              <span>Notifications</span>
            </button>
            <button 
              onClick={() => router.push('/documents')}
              id="nav-documents"
              className={getButtonClasses('/documents')}
            >
              <i className="fa-solid fa-folder text-base" />
              <span>Documents</span>
            </button>
            <button 
              onClick={() => router.push('/calendar')}
              id="nav-calendar"
              className={getButtonClasses('/calendar')}
            >
              <i className="fa-solid fa-calendar text-base" />
              <span>Calendar</span>
            </button>
            <button 
              onClick={() => router.push('/billing')}
              id="nav-billing"
              className={getButtonClasses('/billing')}
            >
              <i className="fa-solid fa-credit-card text-base" />
              <span>Billing</span>
            </button>
            <button 
              onClick={() => router.push('/account')}
              id="nav-account"
              className={getButtonClasses('/account')}
            >
              <i className="fa-solid fa-user text-base" />
              <span>Account</span>
            </button>
            <button 
              onClick={() => router.push('/help')}
              id="nav-help"
              className={getButtonClasses('/help')}
            >
              <i className="fa-solid fa-circle-question text-base" />
              <span>Help Center</span>
            </button>
            <button 
              onClick={() => router.push('/support')}
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
                  onClick={() => router.push('/admin')}
                  id="nav-admin"
                  className={getButtonClasses('/admin')}
                >
                  <i className="fa-solid fa-crown text-base" />
                  <span>Admin Panel</span>
                </button>
                <button 
                  onClick={() => router.push('/tech-support')}
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
            id="nav-logout"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-purple-300 text-sm font-medium transition-colors hover:bg-purple-900/20 cursor-pointer border-none bg-transparent"
          >
            <i className="fa-solid fa-right-from-bracket text-base" />
            <span>Log Out</span>
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
