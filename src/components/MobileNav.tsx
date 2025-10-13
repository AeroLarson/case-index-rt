'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

export default function MobileNav() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show on auth pages
  if (pathname === '/login' || pathname === '/signin' || pathname === '/reset-password') {
    return null
  }

  // Don't show if not logged in
  if (!user) {
    return null
  }

  const navItems = [
    { icon: 'fa-house', label: 'Dashboard', path: '/' },
    { icon: 'fa-magnifying-glass', label: 'Search', path: '/search' },
    { icon: 'fa-chart-line', label: 'Analytics', path: '/analytics' },
    { icon: 'fa-calendar', label: 'Calendar', path: '/calendar' },
    { icon: 'fa-user', label: 'Account', path: '/account' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Bottom Mobile Navigation - Fixed */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-purple-400/20 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="grid grid-cols-5 gap-1 px-1 py-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 min-h-[60px] ${
                isActive(item.path)
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 active:bg-white/10 active:scale-95'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              <span className="text-xs font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Add padding to bottom of page to account for fixed nav */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          body {
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 70px) !important;
          }
        }
      `}</style>
    </>
  )
}

