'use client'

import { useRouter } from 'next/navigation'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useAuth } from '@/contexts/AuthContext'
import ClientOnly from '@/components/ClientOnly'
import EmptyState from '@/components/EmptyState'
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
  
  if (user) {
    // Check if user has any data
    const hasData = userProfile && (
      userProfile.savedCases.length > 0 || 
      userProfile.recentSearches.length > 0 || 
      userProfile.starredCases.length > 0
    )

    // Show empty state for new users
    if (!hasData) {
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

          {/* Clio Integration Status */}
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
              {userProfile?.recentSearches.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.recentSearches.slice(0, 3).map((search) => (
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
              {userProfile?.savedCases.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.savedCases.slice(0, 3).map((case_) => (
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

      {/* Demo Preview Section */}
      <div className="py-8 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 fade-in-up">
            <h2 className="text-white text-2xl lg:text-3xl font-bold mb-4">See What You Can Do</h2>
            <p className="text-purple-300 text-base lg:text-lg">Preview of your dashboard with sample data</p>
          </div>

              {/* Demo Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
                <div className="apple-card p-6 lg:p-8 text-center hover-lift hover-glow fade-in-up stagger-1">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg">
                    <i className="fa-solid fa-folder-open text-white text-xl lg:text-2xl" />
                  </div>
                  <p className="text-white text-3xl lg:text-4xl font-bold m-0 mb-3 tracking-tight">12</p>
                  <p className="text-gray-300 text-sm lg:text-base font-medium m-0">Active Cases</p>
                </div>
                <div className="apple-card p-6 lg:p-8 text-center hover-lift hover-glow fade-in-up stagger-2">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg">
                    <i className="fa-solid fa-calendar text-white text-xl lg:text-2xl" />
                  </div>
                  <p className="text-white text-3xl lg:text-4xl font-bold m-0 mb-3 tracking-tight">3</p>
                  <p className="text-gray-300 text-sm lg:text-base font-medium m-0">Upcoming Hearings</p>
                </div>
                <div className="apple-card p-6 lg:p-8 text-center hover-lift hover-glow fade-in-up stagger-3 sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg">
                    <i className="fa-solid fa-file-circle-plus text-white text-xl lg:text-2xl" />
                  </div>
                  <p className="text-white text-3xl lg:text-4xl font-bold m-0 mb-3 tracking-tight">5</p>
                  <p className="text-gray-300 text-sm lg:text-base font-medium m-0">New Filings</p>
                </div>
              </div>

          {/* Demo Case Updates */}
          <div className="apple-card p-8 hover-lift fade-in-up stagger-4">
            <h3 className="text-white text-2xl font-semibold mb-8 tracking-tight">Recent Case Updates</h3>
            <div className="grid gap-6">
              <div className="apple-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>
                    <h4 className="text-white text-lg font-semibold m-0">Smith v. Johnson</h4>
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">FL-2024-001234</span>
                  </div>
                  <span className="text-gray-400 text-sm">2 hours ago</span>
                </div>
                <p className="text-gray-300 text-base m-0 mb-4 ml-7 leading-relaxed">New motion for temporary custody filed by petitioner. Hearing scheduled for October 11, 2025.</p>
                <div className="flex justify-between items-center ml-7">
                  <span className="text-gray-400 text-sm">San Diego Superior Court • Judge Martinez</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Preview Section */}
      <div className="py-6 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 fade-in-up">
            <h2 className="text-white text-2xl lg:text-3xl font-bold mb-4">Smart Calendar Integration</h2>
            <p className="text-purple-300 text-base lg:text-lg">Never miss a hearing with intelligent calendar management</p>
          </div>
          
          <div className="apple-card p-8 hover-lift fade-in-up mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white text-2xl font-semibold mb-4">Upcoming Hearings</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-exclamation text-white text-lg"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Smith v. Johnson - Custody Hearing</h4>
                      <p className="text-gray-400 text-sm">Today, 2:00 PM • San Diego Superior Court</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-calendar text-white text-lg"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Davis v. Wilson - Settlement Conference</h4>
                      <p className="text-gray-400 text-sm">Tomorrow, 10:00 AM • Virtual Hearing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-gavel text-white text-lg"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Brown v. Garcia - Final Hearing</h4>
                      <p className="text-gray-400 text-sm">Oct 15, 9:00 AM • San Diego Superior Court</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-white text-2xl font-semibold mb-4">Calendar Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300">
                    <i className="fa-solid fa-sync text-blue-400 text-lg"></i>
                    <span className="text-gray-300">Auto-sync with Clio CRM</span>
                  </div>
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300">
                    <i className="fa-solid fa-bell text-green-400 text-lg"></i>
                    <span className="text-gray-300">Smart reminders & notifications</span>
                  </div>
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300">
                    <i className="fa-solid fa-video text-purple-400 text-lg"></i>
                    <span className="text-gray-300">Virtual hearing links</span>
                  </div>
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300">
                    <i className="fa-solid fa-file text-orange-400 text-lg"></i>
                    <span className="text-gray-300">Document attachments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Overview Preview Section */}
      <div className="py-6 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 fade-in-up">
            <h2 className="text-white text-2xl lg:text-3xl font-bold mb-4">AI-Powered Case Intelligence</h2>
            <p className="text-purple-300 text-base lg:text-lg">Get instant insights and summaries with advanced AI</p>
          </div>
          
          <div className="apple-card p-8 hover-lift fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white text-2xl font-semibold mb-4">AI Case Analysis</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-brain text-purple-400"></i>
                      <span>AI Case Analysis</span>
                    </h4>
                    <div className="text-gray-300 text-sm">
                      <div className="bg-white/5 rounded-lg p-3 mb-3">
                        <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Case: Johnson v. Martinez (FL-2024-001234)</span>
                        </div>
                        <div className="animate-apple-intelligence">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400">•</span>
                              <span>Custody dispute, 2 children, filed March 2024</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-orange-400">⚠</span>
                              <span>High conflict, mediation recommended</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">→</span>
                              <span>Next: Settlement conference Oct 15</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400">📄</span>
                              <span>3 motions filed, discovery ongoing</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400">💰</span>
                              <span>Child support: $1,200/month pending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
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
              <div>
                <h3 className="text-white text-2xl font-semibold mb-4">AI Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300 animate-slide-in-gentle">
                    <i className="fa-solid fa-brain text-purple-400 text-lg"></i>
                    <span className="text-gray-300">Intelligent case analysis</span>
                  </div>
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300 animate-slide-in-gentle" style={{animationDelay: '0.2s'}}>
                    <i className="fa-solid fa-file-text text-blue-400 text-lg"></i>
                    <span className="text-gray-300">Document summarization</span>
                  </div>
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300 animate-slide-in-gentle" style={{animationDelay: '0.4s'}}>
                    <i className="fa-solid fa-chart-line text-green-400 text-lg"></i>
                    <span className="text-gray-300">Trend analysis & predictions</span>
                  </div>
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300 animate-slide-in-gentle" style={{animationDelay: '0.6s'}}>
                    <i className="fa-solid fa-lightbulb text-yellow-400 text-lg"></i>
                    <span className="text-gray-300">Strategic recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Showcase Section */}
      <div className="py-12 px-6 bg-gradient-to-b from-transparent to-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 fade-in-up">
            <h2 className="text-white text-4xl font-bold mb-4">Analytics That Matter</h2>
            <p className="text-purple-300 text-xl">Track every detail of your case management</p>
          </div>

          {/* Mock Analytics Dashboard Preview */}
          <div className="apple-card p-8 fade-in-up hover-lift" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Stats Preview */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <i className="fa-solid fa-search text-white text-xl"></i>
                </div>
                <p className="text-white text-3xl font-bold mb-1">247</p>
                <p className="text-gray-300 text-sm">Total Searches</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <i className="fa-solid fa-bookmark text-white text-xl"></i>
                </div>
                <p className="text-white text-3xl font-bold mb-1">42</p>
                <p className="text-gray-300 text-sm">Saved Cases</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <i className="fa-solid fa-calendar-check text-white text-xl"></i>
                </div>
                <p className="text-white text-3xl font-bold mb-1">8</p>
                <p className="text-gray-300 text-sm">Upcoming Events</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <i className="fa-solid fa-chart-line text-white text-xl"></i>
                </div>
                <p className="text-white text-3xl font-bold mb-1">156%</p>
                <p className="text-gray-300 text-sm">Growth Rate</p>
              </div>
            </div>

            {/* Mock Chart Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-blue-400"></i>
                  Search Trends
                </h4>
                {/* Simple line chart representation */}
                <div className="h-40 flex items-end gap-2">
                  {[40, 55, 65, 58, 75, 90].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg transition-all hover:from-blue-400 hover:to-cyan-400" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-pie text-purple-400"></i>
                  Case Distribution
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-gray-300 text-sm">Family Law 45%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-gray-300 text-sm">Civil 30%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                    <span className="text-gray-300 text-sm">Criminal 15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                    <span className="text-gray-300 text-sm">Other 10%</span>
                  </div>
                </div>
                {/* Simple donut chart representation */}
                <div className="mt-6 w-32 h-32 mx-auto rounded-full relative" style={{
                  background: 'conic-gradient(from 0deg, #3b82f6 0deg 162deg, #8b5cf6 162deg 270deg, #06b6d4 270deg 324deg, #6366f1 324deg 360deg)'
                }}>
                  <div className="absolute inset-4 rounded-full bg-slate-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 fade-in-up">
            <h2 className="text-white text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-purple-300 text-lg">Everything you need to manage your legal cases</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center apple-card p-8 hover-lift fade-in-left stagger-1">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-database text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">Live County Data</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Direct access to California court records, automatically synced and updated in real-time</p>
            </div>
            <div className="text-center apple-card p-8 hover-lift fade-in-up stagger-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-robot text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">AI-Powered Insights</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Smart case summaries, risk analysis, and strategic recommendations</p>
            </div>
            <div className="text-center apple-card p-8 hover-lift fade-in-right stagger-3">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-link text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">Easy Clio Integration</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Seamlessly sync cases, calendars, and contacts with your Clio account</p>
            </div>
            <div className="text-center apple-card p-8 hover-lift fade-in-left stagger-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-calendar-check text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">Smart Calendar</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Automated hearing tracking with reminders and virtual meeting links</p>
            </div>
            <div className="text-center apple-card p-8 hover-lift fade-in-up stagger-5">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-bell text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">Real-Time Updates</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Instant notifications when new filings, motions, or orders are added</p>
            </div>
            <div className="text-center apple-card p-8 hover-lift fade-in-right stagger-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-chart-line text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">Analytics Dashboard</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Comprehensive insights into your case management activity and trends</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <h2 className="text-white text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-purple-300 text-lg mb-8">Join thousands of legal professionals tracking their cases</p>
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover-lift btn-pulse"
          >
            Create Your Account
          </button>
        </div>
      </div>
    </main>
  )
}