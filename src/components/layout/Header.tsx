'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignIn = () => {
    router.push('/login')
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  return (
    <header 
      id="header-dashboard" 
      className="relative overflow-hidden lg:ml-60"
      style={{
        background: 'linear-gradient(135deg,#1a0b2e 0%,#2d1b4e 50%,#4c1d95 100%)',
        padding: user 
          ? (pathname === '/' ? '10px 24px 40px' : '10px 24px 10px') // Much smaller purple area
          : '10px 24px 80px', // Smaller header for non-authenticated users
      }}
    >
      {/* Background Effects */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 50%,rgba(139,92,246,0.3) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(168,85,247,0.2) 0%,transparent 50%)'
        }}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation */}
        <div className={`flex justify-between items-center ${pathname === '/' ? 'mb-8' : 'mb-1'}`}>
          {/* Mobile menu button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden text-white p-2"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6">
            <button 
              onClick={() => router.push('/')}
              className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => router.push('/about')}
              className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => router.push('/pricing')}
              className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => router.push('/privacy')}
              className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer"
            >
              Privacy
            </button>
          </nav>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-gray-900 border-t border-purple-400/20 lg:hidden z-50">
              <nav className="flex flex-col p-4 space-y-2">
                <button 
                  onClick={() => { router.push('/'); setMobileMenuOpen(false); }}
                  className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer text-left py-2"
                >
                  Home
                </button>
                <button 
                  onClick={() => { router.push('/about'); setMobileMenuOpen(false); }}
                  className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer text-left py-2"
                >
                  About
                </button>
                <button 
                  onClick={() => { router.push('/pricing'); setMobileMenuOpen(false); }}
                  className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer text-left py-2"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => { router.push('/privacy'); setMobileMenuOpen(false); }}
                  className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer text-left py-2"
                >
                  Privacy
                </button>
              </nav>
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white border-none px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleSignIn}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-none px-6 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

            {/* Hero Content - Only show for non-authenticated users */}
            {!user && (
              <div className="text-center">
                <h1 
                  id="title-dashboard" 
                  className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                >
                  Search California Court Cases<br className="hidden sm:block"/>
                  with AI-Powered Precision
                </h1>
                <p className="text-purple-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
                  Access comprehensive case data from San Diego County family law cases. Track filings, hearings, and documents in real-time with automated updates.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => router.push('/login')}
                    className="bg-purple-400 text-white border-none px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold cursor-pointer hover:bg-purple-500 transition-colors hover-lift btn-pulse"
                  >
                    Get Started
                  </button>
                  <button 
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-transparent text-white border-2 border-purple-400 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold cursor-pointer hover:bg-purple-400/10 transition-colors hover-lift hover-glow"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            )}

            {/* Welcome message only for dashboard (home page) */}
            {user && pathname === '/' && (
              <div className="text-center">
                <h1 
                  id="title-dashboard" 
                  className="text-white text-4xl font-bold leading-tight mb-4"
                >
                  Welcome back, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-purple-300 text-lg leading-relaxed max-w-2xl mx-auto">
                  Here's your personalized dashboard with your latest case updates and insights.
                </p>
              </div>
            )}
      </div>
    </header>
  )
}
