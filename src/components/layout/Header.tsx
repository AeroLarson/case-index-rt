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
      className={`relative overflow-hidden ${user ? 'lg:ml-60' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #0f0520 0%, #1a0b2e 25%, #2d1b4e 50%, #3d2563 75%, #4c1d95 100%)',
        minHeight: user && pathname === '/' ? '300px' : '80px'
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="particle" style={{ left: '20%', animationDelay: '0.5s' }}></div>
        <div className="particle" style={{ left: '30%', animationDelay: '1s' }}></div>
        <div className="particle" style={{ left: '40%', animationDelay: '1.5s' }}></div>
        <div className="particle" style={{ left: '50%', animationDelay: '2s' }}></div>
        <div className="particle" style={{ left: '60%', animationDelay: '2.5s' }}></div>
        <div className="particle" style={{ left: '70%', animationDelay: '1.5s' }}></div>
        <div className="particle" style={{ left: '80%', animationDelay: '2.5s' }}></div>
        <div className="particle" style={{ left: '90%', animationDelay: '3.5s' }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10 px-4">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo - Left side */}
          {!user && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-gavel text-white text-xl"></i>
              </div>
              <span className="text-white text-xl font-bold hidden sm:block">Case Index RT</span>
            </div>
          )}

          {/* User Profile & Logout - Right side */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white text-xs font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {/* Desktop Navigation - Center */}
          {!user && (
            <nav className="hidden lg:flex gap-8">
              <button 
                onClick={() => router.push('/')}
                className="text-purple-300 text-sm font-medium transition-colors hover:text-white"
              >
                Home
              </button>
              <button 
                onClick={() => router.push('/about')}
                className="text-purple-300 text-sm font-medium transition-colors hover:text-white"
              >
                About
              </button>
              <button 
                onClick={() => router.push('/pricing')}
                className="text-purple-300 text-sm font-medium transition-colors hover:text-white"
              >
                Pricing
              </button>
            </nav>
          )}

          {/* Sign In Button - Right side when not logged in */}
          {!user && (
            <button 
              onClick={handleSignIn}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          )}

          {/* Mobile menu button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden text-white p-2"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black/90 backdrop-blur-sm border-t border-purple-400/20 mb-4">
            <div className="px-4 py-6">
              <nav className="flex flex-col gap-4">
                {!user ? (
                  <>
                    <button 
                      onClick={() => {
                        router.push('/')
                        setMobileMenuOpen(false)
                      }}
                      className="text-purple-300 text-sm font-medium transition-colors hover:text-white text-left"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => {
                        router.push('/about')
                        setMobileMenuOpen(false)
                      }}
                      className="text-purple-300 text-sm font-medium transition-colors hover:text-white text-left"
                    >
                      About
                    </button>
                    <button 
                      onClick={() => {
                        router.push('/pricing')
                        setMobileMenuOpen(false)
                      }}
                      className="text-purple-300 text-sm font-medium transition-colors hover:text-white text-left"
                    >
                      Pricing
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded-lg">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-purple-300 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}

        {/* Hero Content - Only show for non-authenticated users */}
        {!user && (
          <div className="text-center py-12">
            <h1 
              className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
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
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent text-white border-2 border-white/20 px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-white/10"
              >
                Learn More
              </button>
            </div>
          </div>
        )}

        {/* Welcome message only for dashboard (home page) */}
        {user && pathname === '/' && (
          <div className="text-center py-12">
            <h1 
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