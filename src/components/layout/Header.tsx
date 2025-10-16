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
      className={`relative overflow-hidden ${user ? 'lg:ml-60' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #0f0520 0%, #1a0b2e 25%, #2d1b4e 50%, #3d2563 75%, #4c1d95 100%)',
        padding: user 
          ? (pathname === '/' ? '10px 16px 40px' : '10px 16px 10px') // Mobile-friendly padding
          : '10px 16px 80px', // Mobile-friendly padding
      }}
      className="vercel-blur"
    >
      {/* Background Effects */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 50%,rgba(139,92,246,0.3) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(168,85,247,0.2) 0%,transparent 50%)'
        }}
      />
      
      {/* Vercel-inspired animated background */}
      <div className="absolute inset-0 pointer-events-none vercel-gradient-subtle opacity-30" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="particle" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="particle" style={{ left: '20%', animationDelay: '1s' }}></div>
        <div className="particle" style={{ left: '30%', animationDelay: '2s' }}></div>
        <div className="particle" style={{ left: '40%', animationDelay: '3s' }}></div>
        <div className="particle" style={{ left: '50%', animationDelay: '4s' }}></div>
        <div className="particle" style={{ left: '60%', animationDelay: '5s' }}></div>
        <div className="particle" style={{ left: '70%', animationDelay: '1.5s' }}></div>
        <div className="particle" style={{ left: '80%', animationDelay: '2.5s' }}></div>
        <div className="particle" style={{ left: '90%', animationDelay: '3.5s' }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation */}
        <div className={`flex items-center justify-between ${pathname === '/' ? 'mb-8' : 'mb-1'}`}>
          {/* Logo and Name - Top Left when not logged in */}
          {!user && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-gavel text-white text-xl"></i>
              </div>
              <span className="text-white text-xl font-bold hidden sm:block">Case Index RT</span>
            </div>
          )}
          
          {/* Empty div for spacing when user is logged in */}
          {user && <div></div>}

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

          {/* Hamburger Menu Button - Mobile Only */}
          {!user && (
            <button 
              className="lg:hidden text-white p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          )}

          {/* Mobile Navigation Menu - Slide-in Panel */}
          {!user && (
            <div 
              className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={toggleMobileMenu}
              ></div>
              
              {/* Menu Panel */}
              <div 
                className={`absolute top-0 right-0 h-full w-80 sm:w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-transform duration-300 border-l border-slate-700/50 ${
                  mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                {/* Close Button */}
                <div className="flex justify-end p-4">
                  <button
                    onClick={toggleMobileMenu}
                    className="text-white p-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    aria-label="Close menu"
                  >
                    <i className="fa-solid fa-xmark text-2xl"></i>
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="flex flex-col gap-1 px-4 pt-4">
                  <button 
                    onClick={() => { router.push('/'); setMobileMenuOpen(false); }}
                    className="text-purple-300 text-left px-4 py-4 rounded-xl hover:bg-white/10 transition-all font-medium min-h-[52px] flex items-center gap-3 text-base"
                  >
                    <i className="fa-solid fa-house w-5 text-center"></i>
                    Home
                  </button>
                  <button 
                    onClick={() => { router.push('/about'); setMobileMenuOpen(false); }}
                    className="text-purple-300 text-left px-4 py-4 rounded-xl hover:bg-white/10 transition-all font-medium min-h-[52px] flex items-center gap-3 text-base"
                  >
                    <i className="fa-solid fa-circle-info w-5 text-center"></i>
                    About
                  </button>
                  <button 
                    onClick={() => { router.push('/pricing'); setMobileMenuOpen(false); }}
                    className="text-purple-300 text-left px-4 py-4 rounded-xl hover:bg-white/10 transition-all font-medium min-h-[52px] flex items-center gap-3 text-base"
                  >
                    <i className="fa-solid fa-dollar-sign w-5 text-center"></i>
                    Pricing
                  </button>
                  <button 
                    onClick={() => { router.push('/privacy'); setMobileMenuOpen(false); }}
                    className="text-purple-300 text-left px-4 py-4 rounded-xl hover:bg-white/10 transition-all font-medium min-h-[52px] flex items-center gap-3 text-base"
                  >
                    <i className="fa-solid fa-shield-halved w-5 text-center"></i>
                    Privacy
                  </button>
                  
                  <div className="h-px bg-purple-400/20 my-6 mx-4"></div>
                  
                  <button 
                    onClick={() => { handleSignIn(); setMobileMenuOpen(false); }}
                    className="mx-4 px-4 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 font-medium transition-all min-h-[52px] flex items-center justify-center gap-2 shadow-lg text-base"
                  >
                    <i className="fa-solid fa-arrow-right-to-bracket"></i>
                    Sign In
                  </button>
                </nav>
              </div>
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-4 ml-auto">
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
                     <div className="text-center mt-8">
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
          <div className="text-center mt-8 px-4 ml-8">
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
