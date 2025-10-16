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
        minHeight: user && pathname === '/' ? '400px' : '80px'
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
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation */}
        <div className={`flex items-center justify-between py-4 ${pathname === '/' ? 'mb-8' : 'mb-1'}`}>
          {/* Logo and Name - Top Left when not logged in */}
          {!user && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-gavel text-white text-xl"></i>
              </div>
              <span className="text-white text-xl font-bold hidden sm:block">Case Index RT</span>
            </div>
          )}
          
          {/* User info and logout - Top Right when logged in */}
          {user && (
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
                className="bg-red-600 hover:bg-red-700 text-white border-none px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {/* Desktop Navigation - Centered when not logged in */}
          {!user && (
            <nav className="hidden lg:flex gap-8 absolute left-1/2 transform -translate-x-1/2">
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
          )}

          {/* Mobile menu button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden text-white p-2"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-purple-400/20">
              <div className="px-4 py-6">
                <nav className="flex flex-col gap-4">
                  {!user ? (
                    <>
                      <button 
                        onClick={() => {
                          router.push('/')
                          setMobileMenuOpen(false)
                        }}
                        className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer text-left"
                      >
                        Home
                      </button>
                      <button 
                        onClick={() => {
                          router.push('/about')
                          setMobileMenuOpen(false)
                        }}
                        className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer text-left"
                      >
                        About
                      </button>
                      <button 
                        onClick={() => {
                          router.push('/pricing')
                          setMobileMenuOpen(false)
                        }}
                        className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer text-left"
                      >
                        Pricing
                      </button>
                      <button 
                        onClick={() => {
                          router.push('/privacy')
                          setMobileMenuOpen(false)
                        }}
                        className="text-purple-300 text-sm font-medium transition-colors hover:text-white border-none bg-transparent cursor-pointer text-left"
                      >
                        Privacy
                      </button>
                      <div className="pt-4 border-t border-purple-400/20">
                        <button 
                          onClick={() => {
                            handleSignIn()
                            setMobileMenuOpen(false)
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors"
                        >
                          Sign In
                        </button>
                      </div>
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
                        className="w-full bg-red-600 hover:bg-red-700 text-white border-none px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          )}

          {/* Sign In Button - Top Right when not logged in */}
          {!user && (
            <div className="hidden lg:flex items-center gap-4">
              <button 
                onClick={handleSignIn}
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-none px-6 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

                   {/* Hero Content - Only show for non-authenticated users */}
                   {!user && (
                     <div className="text-center mt-8 pb-12">
                       <h1 
                         id="title-dashboard" 
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
                           className="vercel-button text-white border-none px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold cursor-pointer hover-lift btn-pulse"
                         >
                           Get Started
                         </button>
                         <button 
                           onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                           className="bg-transparent text-white border-2 border-white/20 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold cursor-pointer hover:bg-white/10 transition-all duration-300 hover-lift vercel-glow"
                         >
                           Learn More
                         </button>
                       </div>
                     </div>
                   )}

        {/* Welcome message only for dashboard (home page) */}
        {user && pathname === '/' && (
          <div className="text-center mt-8 px-4">
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