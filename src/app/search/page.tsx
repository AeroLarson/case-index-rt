'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import EnhancedCaseDetails from '@/components/EnhancedCaseDetails'
import AIOverview from '@/components/AIOverview'
import CaseTimeline from '@/components/CaseTimeline'
import { userProfileManager } from '@/lib/userProfile'
import EmptyState from '@/components/EmptyState'

interface CaseResult {
  id: string
  caseNumber: string
  title: string
  court: string
  judge: string
  status: string
  lastActivity: string
  parties: {
    plaintiff: string
    defendant: string
  }
  documents: number
  hearings: number
  isDetailed: boolean
}

export default function SearchPage() {
  const { user, userProfile, refreshProfile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CaseResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCaseDetails, setShowCaseDetails] = useState(false)
  const [caseDetails, setCaseDetails] = useState<any>(null)
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'recent' | 'starred'>('search')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Handle URL parameters
  useEffect(() => {
    if (searchParams) {
      // Handle pre-filled search query
      const query = searchParams.get('q')
      if (query) {
        setSearchQuery(query)
        // Auto-search if query is provided
        setTimeout(() => {
          handleSearch({ preventDefault: () => {} } as React.FormEvent)
        }, 100)
      }

      // Handle case number search
      const caseNumber = searchParams.get('case')
      if (caseNumber) {
        setSearchQuery(caseNumber)
        // Auto-search for the case
        setTimeout(() => {
          handleSearch({ preventDefault: () => {} } as React.FormEvent)
        }, 100)
      }

      // Handle tab selection
      const tab = searchParams.get('tab')
      if (tab && ['saved', 'recent', 'starred'].includes(tab)) {
        setActiveTab(tab as 'saved' | 'recent' | 'starred')
      }
    }
  }, [searchParams])

  // Get user subscription status from profile
  const isProUser = userProfile?.plan === 'pro' || userProfile?.plan === 'team'
  const isBasicUser = userProfile?.plan === 'free'
  const monthlyUsage = userProfile?.monthlyUsage || 0
  const maxMonthlyUsage = userProfile?.maxMonthlyUsage || 1

  // Don't render anything if not logged in
  if (!user) return null

  const mockSearchResults: CaseResult[] = [
    {
      id: '1',
      caseNumber: 'FL-2024-001234',
      title: 'Johnson v. Martinez - Dissolution with Minor Children',
      court: 'San Diego Superior Court - Central (Department 602)',
      judge: 'Hon. Rebecca Kanter',
      status: 'Post-Judgment - Request for Order',
      lastActivity: 'October 12, 2025',
      parties: {
        plaintiff: 'Sarah Johnson (Petitioner)',
        defendant: 'Michael Martinez (Respondent)'
      },
      documents: 23,
      hearings: 7,
      isDetailed: isProUser
    },
    {
      id: '2',
      caseNumber: 'FL-2024-002847',
      title: 'Anderson v. Chen - Custody Modification',
      court: 'San Diego Superior Court - North County (Department 403)',
      judge: 'Hon. James Patterson',
      status: 'Active - Mediation Scheduled',
      lastActivity: 'October 10, 2025',
      parties: {
        plaintiff: 'David Anderson (Petitioner)',
        defendant: 'Lisa Chen (Respondent)'
      },
      documents: 18,
      hearings: 4,
      isDetailed: isProUser
    }
  ]

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !user) return

    setIsSearching(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let filteredResults: CaseResult[] = []
    
    // Check if searching for "Aero Larson" - generate test case
    if (searchQuery.toLowerCase().includes('aero larson')) {
      const testCase: CaseResult = {
        id: `test_${Date.now()}`,
        caseNumber: 'FL-2024-TEST001',
        title: 'Larson v. Test Defendant',
        court: 'San Diego Superior Court',
        judge: 'Hon. Test Judge',
        status: 'Active',
        lastActivity: 'Just now',
        parties: {
          plaintiff: 'Aero Larson',
          defendant: 'Test Defendant'
        },
        documents: 5,
        hearings: 2,
        isDetailed: isProUser
      }
      filteredResults = [testCase]
    } else {
      // Regular search with mock data
      filteredResults = mockSearchResults.filter(case_ => 
        case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.parties.plaintiff.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.parties.defendant.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setSearchResults(filteredResults)
    setIsSearching(false)

    // Save search to user profile
    userProfileManager.addRecentSearch(user.id, {
      query: searchQuery,
      searchType: 'case',
      resultsCount: filteredResults.length
    })
    refreshProfile()
  }

  const handleGetCaseDetails = async (case_: CaseResult) => {
    // Check monthly usage for basic users
    if (isBasicUser && monthlyUsage >= maxMonthlyUsage) {
      setShowUpgradeModal(true)
      return
    }

    setIsSearching(true)
    
    // Simulate API call to get case information
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const detailedCase = {
      ...case_,
      detailedInfo: {
        caseHistory: [
          {
            date: '2024-03-15',
            event: 'Motion Hearing',
            description: 'Motion for temporary custody hearing scheduled',
            documents: ['Motion for Temporary Custody', 'Supporting Declaration']
          },
          {
            date: '2024-03-10',
            event: 'Document Filing',
            description: 'Response to motion filed by defendant',
            documents: ['Response to Motion', 'Declaration']
          },
          {
            date: '2024-03-01',
            event: 'Case Filed',
            description: 'Initial complaint filed',
            documents: ['Complaint', 'Summons']
          }
        ],
        upcomingHearings: [
          {
            date: '2024-03-25',
            time: '9:00 AM',
            type: 'Status Conference',
            location: 'San Diego Superior Court, Room 201',
            virtualMeeting: 'Zoom ID: 123-456-7890'
          }
        ],
        documents: [
          'Complaint for Divorce',
          'Summons',
          'Response to Complaint',
          'Motion for Temporary Custody',
          'Declaration of Service'
        ],
        parties: {
          plaintiff: {
            name: 'John Smith',
            attorney: 'Smith & Associates',
            contact: 'john@smithlaw.com'
          },
          defendant: {
            name: 'Jane Johnson',
            attorney: 'Johnson Legal Group',
            contact: 'jane@johnsonlegal.com'
          }
        },
        filedDate: '2024-03-01',
        caseType: 'Family Law'
      }
    }
    
    setCaseDetails(detailedCase)
    setShowCaseDetails(true)
    
    // Increment monthly usage in user profile
    if (user) {
      const success = userProfileManager.incrementMonthlyUsage(user.id)
      if (success) {
        refreshProfile()
      }
    }
    
    setIsSearching(false)
  }

  const handleUpgrade = () => {
    setShowUpgradeModal(false)
    router.push('/pricing')
  }

  const handleCaseClick = (case_: CaseResult) => {
    if (!isProUser && !case_.isDetailed) {
      setShowUpgradeModal(true)
      return
    }
    setSelectedCase(case_)
  }


  const handleAddToCalendar = (case_: CaseResult) => {
    if (!user) return
    
    // Save case to user profile
    userProfileManager.addSavedCase(user.id, {
      caseNumber: case_.caseNumber,
      caseTitle: case_.title,
      caseType: 'Family Law',
      caseStatus: case_.status,
      dateFiled: '2024-01-15',
      department: '602',
      courtLocation: case_.court,
      judicialOfficer: case_.judge,
      parties: {
        petitioner: case_.parties.plaintiff,
        respondent: case_.parties.defendant
      }
    })
    
    // Add calendar event for the case hearing
    userProfileManager.addCalendarEvent(user.id, {
      title: `Hearing - ${case_.title}`,
      date: '2026-01-27', // Format: YYYY-MM-DD
      time: '09:00',
      type: 'hearing',
      caseNumber: case_.caseNumber,
      location: case_.court,
      description: `Request for Order Hearing for ${case_.title}`,
      duration: 60, // 1 hour
      priority: 'high',
      status: 'scheduled',
      virtualMeetingInfo: 'Zoom ID: 123-456-7890, Passcode: 123456'
    })
    
    refreshProfile()
    alert(`Case ${case_.caseNumber} and hearing added to your calendar!`)
  }

  const handleStarCase = (case_: CaseResult) => {
    if (!user) return
    
    // Toggle star status
    const isStarred = userProfileManager.toggleStarredCase(user.id, case_.id)
    refreshProfile()
    
    if (isStarred) {
      alert(`Case ${case_.caseNumber} starred!`)
    } else {
      alert(`Case ${case_.caseNumber} unstarred!`)
    }
  }

  return (
    <main 
      className="min-h-screen animated-aura pb-20 lg:pb-10"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '20px 12px 40px 12px'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 tracking-tight">Case Search</h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg">Search and track California court cases with AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'search'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-search"></i>
                <span>Search</span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'saved'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-folder-open"></i>
                <span>Saved Cases</span>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                  {userProfile?.savedCases?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'recent'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>Recent Searches</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                  {userProfile?.recentSearches?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('starred')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'starred'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-star"></i>
                <span>Starred Cases</span>
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">
                  {userProfile?.starredCases?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'search' && (
              <>
                {/* Search Form */}
            <div className="apple-card p-4 md:p-6 mb-4 md:mb-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by case number, party name, or case title..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 md:py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-base min-h-[48px]"
                  />
                  <i className="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 md:px-8 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-search"></i>
                      <span>Search</span>
                    </>
                  )}
                </button>
              </form>
            </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-white text-2xl font-semibold mb-4">Search Results</h2>
            {searchResults.map((case_) => (
              <div
                key={case_.id}
                onClick={() => handleCaseClick(case_)}
                className="apple-card p-6 hover-lift cursor-pointer transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-2">{case_.title}</h3>
                    <p className="text-blue-300 font-medium">{case_.caseNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      case_.status.includes('Active') 
                        ? 'bg-green-500/20 text-green-400' 
                        : case_.status.includes('Pending')
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : case_.status.includes('Post-Judgment')
                        ? 'bg-blue-500/20 text-blue-400'
                        : case_.status.includes('Settled')
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {case_.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Court</p>
                    <p className="text-white">{case_.court}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Judge</p>
                    <p className="text-white">{case_.judge}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Plaintiff</p>
                    <p className="text-white">{case_.parties.plaintiff}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Defendant</p>
                    <p className="text-white">{case_.parties.defendant}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-6 text-sm text-gray-400">
                    <span><i className="fa-solid fa-file mr-1"></i> {case_.documents} documents</span>
                    <span><i className="fa-solid fa-calendar mr-1"></i> {case_.hearings} hearings</span>
                    <span><i className="fa-solid fa-clock mr-1"></i> {case_.lastActivity}</span>
                  </div>
                  {!isProUser && (
                    <div className="flex items-center gap-2 text-purple-400">
                      <i className="fa-solid fa-lock"></i>
                      <span className="text-sm">Pro feature</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGetCaseDetails(case_)
                    }}
                    disabled={isSearching}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="fa-solid fa-info-circle"></i>
                    )}
                    Get Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCalendar(case_)
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-calendar-plus"></i>
                    Add to Calendar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStarCase(case_)
                    }}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-star"></i>
                    Star Case
                  </button>
                </div>

                {/* Monthly Usage Warning for Basic Users */}
                {isBasicUser && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-300 text-sm">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      <span>Monthly usage: {monthlyUsage}/{maxMonthlyUsage} cases</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="apple-card p-8 text-center">
            <i className="fa-solid fa-search text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-white text-xl font-semibold mb-2">No cases found</h3>
            <p className="text-gray-400">Try adjusting your search terms or search criteria</p>
          </div>
        )}
              </>
            )}

            {/* Saved Cases Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <h2 className="text-white text-2xl font-semibold mb-4">Saved Cases</h2>
                {userProfile?.savedCases && userProfile.savedCases.length > 0 ? (
                  <div className="space-y-4">
                    {userProfile.savedCases.map((case_) => (
                      <div
                        key={case_.id}
                        onClick={() => router.push(`/search?case=${encodeURIComponent(case_.caseNumber)}`)}
                        className="apple-card p-6 hover-lift cursor-pointer transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-white text-xl font-semibold mb-2">{case_.caseTitle}</h3>
                            <p className="text-blue-300 font-medium">{case_.caseNumber}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              case_.caseStatus.includes('Active') 
                                ? 'bg-green-500/20 text-green-400' 
                                : case_.caseStatus.includes('Pending')
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {case_.caseStatus}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Case Type</p>
                            <p className="text-white">{case_.caseType}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Date Filed</p>
                            <p className="text-white">{new Date(case_.dateFiled).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="apple-card p-8 text-center">
                    <i className="fa-solid fa-folder-open text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-white text-xl font-semibold mb-2">No saved cases</h3>
                    <p className="text-gray-400">Save cases from your search results to access them quickly</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches Tab */}
            {activeTab === 'recent' && (
              <div className="space-y-4">
                <h2 className="text-white text-2xl font-semibold mb-4">Recent Searches</h2>
                {userProfile?.recentSearches && userProfile.recentSearches.length > 0 ? (
                  <div className="space-y-4">
                    {userProfile.recentSearches.map((search) => (
                      <div
                        key={search.id}
                        onClick={() => {
                          setSearchQuery(search.query)
                          setActiveTab('search')
                          setTimeout(() => {
                            handleSearch({ preventDefault: () => {} } as React.FormEvent)
                          }, 100)
                        }}
                        className="apple-card p-6 hover-lift cursor-pointer transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-white text-xl font-semibold mb-2">{search.query}</h3>
                            <p className="text-gray-400 text-sm">{search.searchType} • {search.resultsCount} results</p>
                          </div>
                          <span className="text-blue-300 text-sm">{new Date(search.searchedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="apple-card p-8 text-center">
                    <i className="fa-solid fa-clock-rotate-left text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-white text-xl font-semibold mb-2">No recent searches</h3>
                    <p className="text-gray-400">Your search history will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Starred Cases Tab */}
            {activeTab === 'starred' && (
              <div className="space-y-4">
                <h2 className="text-white text-2xl font-semibold mb-4">Starred Cases</h2>
                {userProfile?.starredCases && userProfile.starredCases.length > 0 ? (
                  <div className="space-y-4">
                    {userProfile.starredCases.map((caseId) => {
                      const case_ = userProfile.savedCases?.find(c => c.id === caseId)
                      if (!case_) return null
                      
                      return (
                        <div
                          key={case_.id}
                          onClick={() => router.push(`/search?case=${encodeURIComponent(case_.caseNumber)}`)}
                          className="apple-card p-6 hover-lift cursor-pointer transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                                {case_.caseTitle}
                                <i className="fa-solid fa-star text-yellow-400"></i>
                              </h3>
                              <p className="text-blue-300 font-medium">{case_.caseNumber}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                case_.caseStatus.includes('Active') 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : case_.caseStatus.includes('Pending')
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {case_.caseStatus}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Case Type</p>
                              <p className="text-white">{case_.caseType}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Date Filed</p>
                              <p className="text-white">{new Date(case_.dateFiled).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="apple-card p-8 text-center">
                    <i className="fa-solid fa-star text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-white text-xl font-semibold mb-2">No starred cases</h3>
                    <p className="text-gray-400">Star cases from your search results to mark them as important</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Overview and Timeline Sidebar */}
          <div className="lg:col-span-1">
            {selectedCase ? (
              <>
                    <AIOverview 
                      caseId={selectedCase.caseNumber}
                      caseTitle={selectedCase.title}
                      caseStatus={selectedCase.status}
                      court={selectedCase.court}
                      judge={selectedCase.judge}
                      parties={selectedCase.parties}
                      lastLogin={userProfile?.previousLogin}
                      className="mb-6"
                    />
                <CaseTimeline 
                  caseNumber={selectedCase.caseNumber}
                  className="mb-6"
                />
              </>
            ) : (
              <div className="apple-card p-6 mb-6">
                <h3 className="text-white font-semibold text-lg mb-4">AI Case Overview</h3>
                <div className="text-center text-gray-400">
                  <i className="fa-solid fa-robot text-4xl mb-4 opacity-50"></i>
                  <p className="mb-2">Click on any case to see AI insights</p>
                  <p className="text-sm">AI will analyze case details, timeline, and provide strategic recommendations</p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="apple-card p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Search Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Searches this month</span>
                  <span className="text-white font-semibold">{userProfile?.recentSearches?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Cases tracked</span>
                  <span className="text-white font-semibold">{userProfile?.savedCases?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">AI insights generated</span>
                  <span className="text-white font-semibold">{userProfile?.savedCases?.filter(c => c.aiSummary).length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="apple-card p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-crown text-white text-2xl"></i>
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">Upgrade to Pro</h3>
                <p className="text-gray-400">Get full access to case information, AI insights, and advanced features</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-check text-green-400"></i>
                  <span className="text-gray-300">Case details and documents</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-check text-green-400"></i>
                  <span className="text-gray-300">AI-powered case summaries</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-check text-green-400"></i>
                  <span className="text-gray-300">Calendar integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-check text-green-400"></i>
                  <span className="text-gray-300">Advanced analytics</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Case Details Modal */}
        {showCaseDetails && caseDetails && (
          <EnhancedCaseDetails 
            caseDetails={{
              caseNumber: caseDetails.caseNumber,
              title: caseDetails.title,
              status: caseDetails.status,
              filedDate: caseDetails.detailedInfo?.filedDate || '2024-01-01',
              caseType: caseDetails.detailedInfo?.caseType || 'Family Law',
              county: caseDetails.court,
              judge: caseDetails.judge,
              department: 'FAM-1',
              nextHearing: caseDetails.detailedInfo?.upcomingHearings?.[0] ? {
                date: caseDetails.detailedInfo.upcomingHearings[0].date,
                time: caseDetails.detailedInfo.upcomingHearings[0].time,
                type: caseDetails.detailedInfo.upcomingHearings[0].type,
                location: caseDetails.detailedInfo.upcomingHearings[0].location,
                virtualLinks: caseDetails.detailedInfo.upcomingHearings[0].virtualMeeting ? {
                  zoom: caseDetails.detailedInfo.upcomingHearings[0].virtualMeeting
                } : undefined
              } : undefined,
              documentOrderingUrl: 'https://www.sdcourt.ca.gov/online-services/document-ordering'
            }}
            onClose={() => setShowCaseDetails(false)}
          />
        )}
      </div>
    </main>
  )
}
