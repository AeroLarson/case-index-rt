'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AIOverview from '@/components/AIOverview'
import CaseTimeline from '@/components/CaseTimeline'
import { userProfileManager } from '@/lib/userProfile'
import { AIService } from '@/lib/aiService'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CaseResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCaseDetails, setShowCaseDetails] = useState(false)
  const [caseDetails, setCaseDetails] = useState<any>(null)
  const [aiSummary, setAiSummary] = useState<any>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

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
    },
    {
      id: '3',
      caseNumber: 'FL-2023-009512',
      title: 'Williams v. Rodriguez - Child Support Arrears',
      court: 'San Diego Superior Court - Central (Department 509)',
      judge: 'Hon. Maria Gonzalez',
      status: 'Post-Judgment - Enforcement Hearing',
      lastActivity: 'October 8, 2025',
      parties: {
        plaintiff: 'Jennifer Williams (Petitioner)',
        defendant: 'Carlos Rodriguez (Respondent)'
      },
      documents: 31,
      hearings: 9,
      isDetailed: isProUser
    },
    {
      id: '4',
      caseNumber: 'FL-2025-000123',
      title: 'Thompson v. Brown - Legal Separation',
      court: 'San Diego Superior Court - East County (Department 304)',
      judge: 'Hon. Richard Lee',
      status: 'Active - Discovery Phase',
      lastActivity: 'October 11, 2025',
      parties: {
        plaintiff: 'Emily Thompson (Petitioner)',
        defendant: 'Robert Brown (Respondent)'
      },
      documents: 12,
      hearings: 2,
      isDetailed: isProUser
    },
    {
      id: '5',
      caseNumber: 'FL-2024-005678',
      title: 'Davis v. Miller - Domestic Violence Restraining Order',
      court: 'San Diego Superior Court - Central (Department 701)',
      judge: 'Hon. Catherine Wong',
      status: 'Active - Hearing Set',
      lastActivity: 'October 9, 2025',
      parties: {
        plaintiff: 'Amanda Davis (Protected Party)',
        defendant: 'Steven Miller (Restrained Party)'
      },
      documents: 8,
      hearings: 3,
      isDetailed: isProUser
    },
    {
      id: '6',
      caseNumber: 'FL-2023-012456',
      title: 'Garcia v. Nguyen - Spousal Support Modification',
      court: 'San Diego Superior Court - South County (Department 205)',
      judge: 'Hon. Daniel Foster',
      status: 'Post-Judgment - Motion Pending',
      lastActivity: 'October 7, 2025',
      parties: {
        plaintiff: 'Maria Garcia (Petitioner)',
        defendant: 'Kevin Nguyen (Respondent)'
      },
      documents: 27,
      hearings: 6,
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

  const handleCaseClick = (case_: CaseResult) => {
    if (!isProUser && !case_.isDetailed) {
      setShowUpgradeModal(true)
      return
    }
    setSelectedCase(case_)
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
        }
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

  const handleUpgrade = () => {
    setShowUpgradeModal(false)
    router.push('/pricing')
  }

  const handleGenerateAISummary = async (case_: CaseResult) => {
    if (!isProUser) {
      setShowUpgradeModal(true)
      return
    }

    setIsGeneratingAI(true)
    try {
      // Prepare case data for AI analysis
      const caseData = {
        caseNumber: case_.caseNumber,
        caseTitle: case_.title,
        caseType: 'Family Law', // Default type
        status: case_.status,
        dateFiled: case_.lastActivity,
        parties: {
          petitioner: case_.parties.plaintiff,
          respondent: case_.parties.defendant,
          petitionerAttorney: 'Not specified',
          respondentAttorney: 'Not specified'
        },
        courtLocation: case_.court,
        judicialOfficer: case_.judge
      }

      // Call the AI API
      const response = await fetch('/api/ai/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      })

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`)
      }

      const result = await response.json()
      setAiSummary(result.analysis)
    } catch (error) {
      console.error('Error generating AI summary:', error)
      // Show error message to user
      alert('AI analysis failed. Please try again or contact support.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  return (
    <main 
      className="min-h-screen animated-aura pb-20 lg:pb-10"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '20px 12px 40px 12px' // Optimized mobile padding
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
                      <span className="hidden md:inline">Searching...</span>
                      <span className="md:hidden">Searching...</span>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGenerateAISummary(case_)
                        }}
                        disabled={isGeneratingAI}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingAI ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <i className="fa-solid fa-robot"></i>
                        )}
                        AI Summary
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
                  <p>Select a case to generate AI overview</p>
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

      {/* Case Details Modal */}
      {showCaseDetails && caseDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
          <div className="apple-card p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-white text-2xl font-bold">{caseDetails.title}</h3>
              <button
                onClick={() => setShowCaseDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Case Information */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-4">Case Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Case Number:</span>
                    <span className="text-blue-300 font-mono">{caseDetails.caseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">{caseDetails.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Court:</span>
                    <span className="text-white">{caseDetails.court}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Judge:</span>
                    <span className="text-white">{caseDetails.judge}</span>
                  </div>
                </div>

                {/* Parties */}
                <h4 className="text-white font-semibold text-lg mb-4 mt-6">Parties</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Plaintiff</p>
                    <p className="text-white">{caseDetails.detailedInfo.parties.plaintiff.name}</p>
                    <p className="text-blue-300 text-sm">{caseDetails.detailedInfo.parties.plaintiff.attorney}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Defendant</p>
                    <p className="text-white">{caseDetails.detailedInfo.parties.defendant.name}</p>
                    <p className="text-blue-300 text-sm">{caseDetails.detailedInfo.parties.defendant.attorney}</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Hearings */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-4">Upcoming Hearings</h4>
                <div className="space-y-4">
                  {caseDetails.detailedInfo.upcomingHearings.map((hearing: any, index: number) => (
                    <div key={index} className="p-4 bg-white/5 rounded-2xl">
                      <h5 className="text-white font-semibold mb-2">{hearing.type}</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar text-blue-400"></i>
                          <span className="text-gray-300">{new Date(hearing.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-clock text-blue-400"></i>
                          <span className="text-gray-300">{hearing.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-map-marker-alt text-blue-400"></i>
                          <span className="text-gray-300">{hearing.location}</span>
                        </div>
                        {hearing.virtualMeeting && (
                          <div className="flex items-center gap-2">
                            <i className="fa-solid fa-video text-green-400"></i>
                            <span className="text-green-300">{hearing.virtualMeeting}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Case History */}
            <div className="mt-8">
              <h4 className="text-white font-semibold text-lg mb-4">Case History</h4>
              <div className="space-y-4">
                {caseDetails.detailedInfo.caseHistory.map((event: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-file text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-white font-semibold">{event.event}</h5>
                        <span className="text-gray-400 text-sm">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                      {event.documents.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {event.documents.map((doc: string, docIndex: number) => (
                            <span key={docIndex} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                              {doc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="mt-8">
              <h4 className="text-white font-semibold text-lg mb-4">Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {caseDetails.detailedInfo.documents.map((doc: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <i className="fa-solid fa-file text-blue-400"></i>
                    <span className="text-gray-300">{doc}</span>
                    <button className="text-blue-400 hover:text-blue-300 ml-auto">
                      <i className="fa-solid fa-download"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => handleAddToCalendar(caseDetails)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                <i className="fa-solid fa-calendar-plus mr-2"></i>
                Add to Calendar
              </button>
              <button
                onClick={() => handleStarCase(caseDetails)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                <i className="fa-solid fa-star mr-2"></i>
                Star Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {aiSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
          <div className="apple-card p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-white text-2xl font-bold">AI Case Summary</h3>
              <button
                onClick={() => setAiSummary(null)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-3">Summary</h4>
                <p className="text-gray-300 leading-relaxed">{aiSummary.summary}</p>
              </div>

              {/* Key Risks */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-3">Key Risks</h4>
                <ul className="space-y-2">
                  {aiSummary.keyRisks?.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <i className="fa-solid fa-exclamation-triangle text-yellow-400 mt-1"></i>
                      {risk}
                    </li>
                  )) || <li className="text-gray-400">No specific risks identified</li>}
                </ul>
              </div>

              {/* Risk Assessment */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-3">Risk Assessment</h4>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  (aiSummary.riskAssessment || 'medium') === 'high' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : (aiSummary.riskAssessment || 'medium') === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  <i className={`fa-solid ${
                    (aiSummary.riskAssessment || 'medium') === 'high' 
                      ? 'fa-exclamation-triangle'
                      : (aiSummary.riskAssessment || 'medium') === 'medium'
                      ? 'fa-exclamation-circle'
                      : 'fa-shield-check'
                  }`}></i>
                  {(aiSummary.riskAssessment || 'medium').charAt(0).toUpperCase() + (aiSummary.riskAssessment || 'medium').slice(1)} Risk
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {aiSummary.recommendations?.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <i className="fa-solid fa-lightbulb text-yellow-400 mt-1"></i>
                      {rec}
                    </li>
                  )) || <li className="text-gray-400">No specific recommendations available</li>}
                </ul>
              </div>

              {/* Next Steps */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-3">Next Steps</h4>
                <ul className="space-y-2">
                  {aiSummary.nextSteps?.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <i className="fa-solid fa-arrow-right text-blue-400 mt-1"></i>
                      {step}
                    </li>
                  )) || <li className="text-gray-400">No specific next steps identified</li>}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setAiSummary(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Save AI summary to user profile
                  if (user && selectedCase) {
                    userProfileManager.addSavedCase(user.id, {
                      caseNumber: selectedCase.caseNumber,
                      caseTitle: selectedCase.title,
                      caseType: 'Family Law', // Default type
                      caseStatus: selectedCase.status,
                      dateFiled: selectedCase.lastActivity,
                      department: selectedCase.court,
                      courtLocation: selectedCase.court,
                      judicialOfficer: selectedCase.judge,
                      parties: {
                        petitioner: selectedCase.parties.plaintiff,
                        respondent: selectedCase.parties.defendant
                      },
                      aiSummary: aiSummary.summary,
                      aiGeneratedAt: new Date().toISOString()
                    })
                    refreshProfile()
                    alert('AI Summary saved to your case!')
                  }
                  setAiSummary(null)
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                <i className="fa-solid fa-save mr-2"></i>
                Save Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
