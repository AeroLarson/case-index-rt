'use client'

import { useRouter } from 'next/navigation'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useAuth } from '@/contexts/AuthContext'
import ClientOnly from '@/components/ClientOnly'
import EmptyState from '@/components/EmptyState'

export default function Home() {
  const router = useRouter()
  const { isClient } = useScrollAnimation()
  const { user, userProfile } = useAuth()

  const handleGetStarted = () => {
    router.push('/login')
  }

  // Show personalized dashboard for authenticated users
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
                    : 'Everything in Professional • Up to 5 team members • Clio integration'
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="apple-card p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-folder-open text-white text-xl" />
              </div>
              <p className="text-white text-2xl font-bold m-0 mb-2">{userProfile?.savedCases.length || 0}</p>
              <p className="text-gray-300 text-sm m-0">Saved Cases</p>
            </div>
            <div className="apple-card p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-search text-white text-xl" />
              </div>
              <p className="text-white text-2xl font-bold m-0 mb-2">{userProfile?.recentSearches.length || 0}</p>
              <p className="text-gray-300 text-sm m-0">Recent Searches</p>
            </div>
            <div className="apple-card p-6 text-center hover-lift">
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

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="apple-card p-8">
              <h3 className="text-white text-xl font-semibold mb-6">Recent Searches</h3>
              {userProfile?.recentSearches.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.recentSearches.slice(0, 3).map((search) => (
                    <div key={search.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
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
                    <div key={case_.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
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

      {/* Features Section */}
      <div id="features" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-white text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-purple-300 text-lg">Everything you need to track your cases</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center apple-card p-8 hover-lift fade-in-left stagger-1">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-search text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">AI-Powered Search</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Find cases instantly with intelligent search algorithms</p>
            </div>
            <div className="text-center apple-card p-8 hover-lift fade-in-up stagger-2">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-bell text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">Real-time Notifications</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Stay updated with case changes and hearing reminders</p>
            </div>
            <div className="text-center apple-card p-8 hover-lift fade-in-right stagger-3">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="fa-solid fa-chart-line text-white text-3xl" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 tracking-tight">Analytics Dashboard</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Track case progress with detailed analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-6">
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