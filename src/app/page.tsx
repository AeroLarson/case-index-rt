'use client'

import { useRouter } from 'next/navigation'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useAuth } from '@/contexts/AuthContext'
import ClientOnly from '@/components/ClientOnly'
import EmptyState from '@/components/EmptyState'
import OperationsMap from '@/components/OperationsMap'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const { isClient } = useScrollAnimation()
  const { user, userProfile } = useAuth()
  const [selectedCaseModal, setSelectedCaseModal] = useState<any>(null)

  const handleGetStarted = () => {
    router.push('/login')
  }

  const handleCaseClick = (case_: any) => {
    setSelectedCaseModal(case_)
  }

  // Show personalized dashboard for authenticated users
  console.log('Home page: User state:', user)
  console.log('Home page: UserProfile state:', userProfile)
  console.log('Home page: User plan:', userProfile?.plan)
  console.log('Home page: Clio condition check:', userProfile && (userProfile.plan === 'pro' || userProfile.plan === 'team') && user)
  
  // Check if user has any data (moved outside conditional to avoid hook issues)
  const hasData = user && userProfile && (
    (userProfile.savedCases?.length || 0) > 0 || 
    (userProfile.recentSearches?.length || 0) > 0 || 
    (userProfile.starredCases?.length || 0) > 0
  )

  // Show empty state for new users
  if (user && !hasData) {
    return (
      <main 
        id="main-content" 
        className="min-h-screen"
        style={{
          background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
          padding: '40px 24px'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <EmptyState type="dashboard" />
        </div>
      </main>
    )
  }

  if (user) {

    // Show populated dashboard for users with data
    return (
      <main 
        id="main-content" 
        className="min-h-screen"
        style={{
          background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
          padding: '40px 24px'
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Plan Status */}
          <div className="apple-card p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">
                  Current Plan: {userProfile?.plan === 'free' ? 'Free' : userProfile?.plan === 'pro' ? 'Professional' : 'Team'}
                </h2>
                <p className="text-gray-300">
                  {userProfile?.plan === 'free' 
                    ? '1 case per month • Basic case information only'
                    : userProfile?.plan === 'pro'
                    ? 'Unlimited searches • AI summaries • Calendar integration'
                    : userProfile?.plan === 'team'
                    ? 'Everything in Professional • Up to 5 team members • Clio integration'
                    : 'Custom solution • Unlimited team members • Enterprise features'
                  }
                </p>
              </div>
              {userProfile?.plan === 'free' && (
                <button
                  onClick={() => router.push('/billing')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>

          {/* Usage Warning for Free Users */}
          {userProfile?.plan === 'free' && (userProfile?.monthlyUsage || 0) >= (userProfile?.maxMonthlyUsage || 1) && (
            <div className="apple-card p-6 mb-8 border-l-4 border-yellow-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-exclamation-triangle text-yellow-400 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold">Monthly Limit Reached</h3>
                  <p className="text-gray-300 text-sm">You've used all your free case searches this month.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/billing')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Upgrade to Pro
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  View Plans
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div 
              onClick={() => router.push('/search?tab=saved')}
              className="apple-card p-6 text-center hover-lift cursor-pointer transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-folder-open text-white text-xl" />
              </div>
              <p className="text-white text-2xl font-bold m-0 mb-2">{userProfile?.savedCases.length || 0}</p>
              <p className="text-gray-300 text-sm m-0">Saved Cases</p>
            </div>
            <div 
              onClick={() => router.push('/search?tab=recent')}
              className="apple-card p-6 text-center hover-lift cursor-pointer transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-search text-white text-xl" />
              </div>
              <p className="text-white text-2xl font-bold m-0 mb-2">{userProfile?.recentSearches.length || 0}</p>
              <p className="text-gray-300 text-sm m-0">Recent Searches</p>
            </div>
            <div 
              onClick={() => router.push('/search?tab=starred')}
              className="apple-card p-6 text-center hover-lift cursor-pointer transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-star text-white text-xl" />
              </div>
              <p className="text-white text-2xl font-bold m-0 mb-2">{userProfile?.starredCases.length || 0}</p>
              <p className="text-gray-300 text-sm m-0">Starred Cases</p>
            </div>
            <div className="apple-card p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-chart-line text-white text-xl" />
              </div>
              <p className="text-white text-2xl font-bold m-0 mb-2">
                {userProfile?.plan === 'free' 
                  ? `${userProfile?.monthlyUsage || 0}/${userProfile?.maxMonthlyUsage || 1}`
                  : 'Unlimited'
                }
              </p>
              <p className="text-gray-300 text-sm m-0">Monthly Usage</p>
            </div>
          </div>

          {/* Clio Integration Status - ALWAYS SHOW */}
          <div className="apple-card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <i className="fa-solid fa-link text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold mb-1">Clio CRM Integration</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Connected</span>
                    <span className="text-gray-400 text-sm">• Ready to sync</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/calendar')}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <i className="fa-solid fa-calendar mr-2"></i>
                  View Calendar
                </button>
                <button
                  onClick={() => router.push('/account?tab=integrations')}
                  className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <i className="fa-solid fa-link mr-2"></i>
                  Integration Settings
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="apple-card p-8">
              <h3 className="text-white text-xl font-semibold mb-6">Recent Searches</h3>
              {(userProfile?.recentSearches?.length || 0) > 0 ? (
                <div className="space-y-4">
                  {userProfile?.recentSearches?.slice(0, 3).map((search) => (
                    <div 
                      key={search.id} 
                      onClick={() => router.push(`/search?q=${encodeURIComponent(search.query)}`)}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{search.query}</h4>
                        <p className="text-gray-400 text-sm">{search.searchType} • {search.resultsCount} results</p>
                      </div>
                      <span className="text-blue-300 text-sm">{new Date(search.searchedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState type="search" />
              )}
            </div>

            <div className="apple-card p-8">
              <h3 className="text-white text-xl font-semibold mb-6">Saved Cases</h3>
              {(userProfile?.savedCases?.length || 0) > 0 ? (
                <div className="space-y-4">
                  {userProfile?.savedCases?.slice(0, 3).map((case_) => (
                    <div 
                      key={case_.id} 
                      onClick={() => handleCaseClick(case_)}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{case_.caseTitle}</h4>
                        <p className="text-gray-400 text-sm">{case_.caseType} • {case_.caseStatus}</p>
                      </div>
                      <span className="text-blue-300 text-sm">{case_.caseNumber}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState type="saved-cases" />
              )}
            </div>
          </div>
        </div>

        {/* Case Detail Modal */}
        {selectedCaseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="apple-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-white text-2xl font-bold">{selectedCaseModal.caseTitle}</h3>
                <button
                  onClick={() => setSelectedCaseModal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Case Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-hashtag text-blue-400"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Case Number</p>
                        <p className="text-white font-medium">{selectedCaseModal.caseNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-gavel text-blue-400"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Case Type</p>
                        <p className="text-white font-medium">{selectedCaseModal.caseType}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-calendar text-blue-400"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Date Filed</p>
                        <p className="text-white font-medium">{new Date(selectedCaseModal.dateFiled).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-info-circle text-blue-400"></i>
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedCaseModal.caseStatus.includes('Active') 
                            ? 'bg-green-500/20 text-green-400' 
                            : selectedCaseModal.caseStatus.includes('Pending')
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {selectedCaseModal.caseStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-white font-semibold mb-4">Quick Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setSelectedCaseModal(null)
                        router.push(`/search?case=${encodeURIComponent(selectedCaseModal.caseNumber)}`)
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-search"></i>
                      View Full Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaseModal(null)
                        router.push('/calendar')
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-calendar"></i>
                      View Calendar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaseModal(null)
                        router.push('/notifications')
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-bell"></i>
                      View Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    )
  }

  // Show landing page for non-authenticated users
  return (
    <main 
      id="main-content" 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)'
      }}
    >
      {/* Floating Particles - Optimized */}
      <ClientOnly>
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </ClientOnly>

      {/* Single Hero Section - Modern Tech Startup Style */}
      <section className="relative px-4 lg:px-6 pt-12 pb-10 lg:pt-16 lg:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 fade-in-up">
            {/* Main Headline - Single, Powerful */}
            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Search California Court Cases<br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                with AI-Powered Precision
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto mb-4 leading-relaxed">
              Access comprehensive case data from San Diego County family law cases
            </p>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
              Track filings, hearings, and documents in real-time with automated updates
            </p>
            
            {/* Single CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <button 
                onClick={handleGetStarted}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button 
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/20 text-white backdrop-blur-sm"
              >
                View Pricing
              </button>
            </div>

            {/* Trust Indicators - Better Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="text-center p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-shield-check text-blue-400 text-xl"></i>
                </div>
                <div className="text-white text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Secure</div>
                <div className="text-gray-400 text-xs">Enterprise-Grade Security</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-bolt text-purple-400 text-xl"></i>
                </div>
                <div className="text-white text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Instant</div>
                <div className="text-gray-400 text-xs">Lightning-Fast Results</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group col-span-2 md:col-span-1">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-certificate text-green-400 text-xl"></i>
                </div>
                <div className="text-white text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Accurate</div>
                <div className="text-gray-400 text-xs">Court-Validated Data</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 text-lg">Everything you need to manage your legal cases</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <div className="apple-card p-6 hover-lift transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-database text-white text-2xl" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Live County Data</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Real-time access to California court records with automatic syncing and updates</p>
              </div>
            </div>
            <div className="apple-card p-6 hover-lift transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-robot text-white text-2xl" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Smart case summaries, risk analysis, and strategic recommendations</p>
              </div>
            </div>
            <div className="apple-card p-6 hover-lift transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-calendar-check text-white text-2xl" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Smart Calendar</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Automated hearing tracking with reminders and virtual meeting links</p>
              </div>
            </div>
            <div className="apple-card p-6 hover-lift transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-link text-white text-2xl" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Clio Integration</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Seamlessly sync cases, calendars, and contacts with your Clio account</p>
              </div>
            </div>
            <div className="apple-card p-6 hover-lift transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-bell text-white text-2xl" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Real-Time Updates</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Instant notifications when new filings, motions, or orders are added</p>
              </div>
            </div>
            <div className="apple-card p-6 hover-lift transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-chart-line text-white text-2xl" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Comprehensive insights into your case management activity and trends</p>
              </div>
            </div>
          </div>

          {/* Demo Preview Section */}
          <div className="apple-card p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Case Preview */}
              <div>
                <h3 className="text-white text-2xl font-semibold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-folder-open text-blue-400"></i>
                  Recent Case Update
                </h3>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <h4 className="text-white font-semibold">Smith v. Johnson</h4>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">FL-2024-001234</span>
                    </div>
                    <span className="text-gray-400 text-xs">2 hours ago</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 ml-6">New motion for temporary custody filed. Hearing scheduled for October 11, 2025.</p>
                  <p className="text-gray-400 text-xs ml-6">San Diego Superior Court • Judge Martinez</p>
                </div>
              </div>
              
              {/* Calendar Preview */}
              <div>
                <h3 className="text-white text-2xl font-semibold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-calendar text-green-400"></i>
                  Upcoming Hearings
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-exclamation text-white"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm">Smith v. Johnson - Hearing</h4>
                      <p className="text-gray-400 text-xs">Today, 2:00 PM • San Diego Superior Court</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-calendar text-white"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm">Davis v. Wilson - Conference</h4>
                      <p className="text-gray-400 text-xs">Tomorrow, 10:00 AM • Virtual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Case Intelligence Section */}
      <section className="py-10 px-4 lg:px-6 bg-gradient-to-b from-transparent to-purple-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">AI-Powered Case Intelligence</h2>
            <p className="text-gray-400 text-lg">Get instant insights and summaries with advanced AI</p>
          </div>
          
          <div className="apple-card p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Case Analysis Example */}
              <div>
                <h3 className="text-white text-2xl font-semibold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-brain text-purple-400"></i>
                  AI Case Analysis
                </h3>
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
                    <div className="bg-white/5 rounded-lg p-4 mb-3">
                      <div className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Case: Johnson v. Martinez (FL-2024-001234)</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Custody dispute, 2 children, filed March 2024</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-orange-400 mt-1">⚠</span>
                          <span>High conflict, mediation recommended</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">→</span>
                          <span>Next: Settlement conference Oct 15</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">📄</span>
                          <span>3 motions filed, discovery ongoing</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">💰</span>
                          <span>Child support: $1,200/month pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-shield-check text-green-400"></i>
                      Risk Assessment
                    </h4>
                    <div className="text-gray-300 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Standard family law proceedings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⚠</span>
                        <span>Moderate conflict level</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Features List */}
              <div>
                <h3 className="text-white text-2xl font-semibold mb-6">AI Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-brain text-purple-400 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Intelligent Case Analysis</h4>
                      <p className="text-gray-400 text-sm">Automated case summaries and insights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-file-text text-blue-400 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Document Summarization</h4>
                      <p className="text-gray-400 text-sm">Quick understanding of complex filings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-chart-line text-green-400 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Trend Analysis & Predictions</h4>
                      <p className="text-gray-400 text-sm">Data-driven insights for your cases</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-lightbulb text-yellow-400 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Strategic Recommendations</h4>
                      <p className="text-gray-400 text-sm">Actionable insights for case strategy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operations Map Section */}
      <section className="py-10 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <OperationsMap />
        </div>
      </section>

      {/* Final CTA Section - Modern & Clean */}
      <section className="py-12 px-4 lg:px-6 bg-gradient-to-b from-purple-900/10 via-blue-900/5 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30">
            <span className="text-purple-300 text-sm font-medium">Join hundreds of legal professionals</span>
          </div>
          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">Start tracking cases with AI-powered insights today. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-2xl overflow-hidden"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button 
              onClick={() => router.push('/pricing')}
              className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/20 text-white backdrop-blur-sm"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}