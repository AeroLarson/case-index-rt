'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import EnhancedCaseDetails from '@/components/EnhancedCaseDetails'
import AIOverview from '@/components/AIOverview'
import CaseTimeline from '@/components/CaseTimeline'
import SimpleErrorBoundary from '@/components/SimpleErrorBoundary'
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

function SearchPageContent() {
  const { user, userProfile, refreshProfile, isLoading } = useAuth()
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
  
  // Enhanced search fields
  const [searchFields, setSearchFields] = useState({
    caseNumber: '',
    partyName: '',
    defendantName: '',
    complainantName: '',
    attorneyName: '',
    caseType: '',
    dateRange: {
      start: '',
      end: ''
    }
  })
  const [activeSearchType, setActiveSearchType] = useState<'caseNumber' | 'partyName' | 'defendantName' | 'complainantName' | 'attorneyName' | 'all'>('all')

  // Redirect to login if not authenticated (only after loading is complete)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
      
      // Escape to clear search
      if (e.key === 'Escape') {
        setSearchQuery('')
        setSearchFields({
          caseNumber: '',
          partyName: '',
          defendantName: '',
          complainantName: '',
          attorneyName: '',
          caseType: '',
          dateRange: { start: '', end: '' }
        })
        setSearchResults([])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Get user subscription status from profile
  const isProUser = userProfile?.plan === 'pro' || userProfile?.plan === 'team'
  const isBasicUser = userProfile?.plan === 'free'
  const monthlyUsage = userProfile?.monthlyUsage || 0
  const maxMonthlyUsage = userProfile?.maxMonthlyUsage || 1

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Determine search query and type based on active search type
    let query = ''
    let searchType = 'all'
    
    if (activeSearchType === 'caseNumber' && searchFields.caseNumber.trim()) {
      query = searchFields.caseNumber.trim()
      searchType = 'caseNumber'
    } else if (activeSearchType === 'partyName' && searchFields.partyName.trim()) {
      query = searchFields.partyName.trim()
      searchType = 'name'
    } else if (activeSearchType === 'defendantName' && searchFields.defendantName.trim()) {
      query = searchFields.defendantName.trim()
      searchType = 'name'
    } else if (activeSearchType === 'complainantName' && searchFields.complainantName.trim()) {
      query = searchFields.complainantName.trim()
      searchType = 'name'
    } else if (activeSearchType === 'attorneyName' && searchFields.attorneyName.trim()) {
      query = searchFields.attorneyName.trim()
      searchType = 'attorney'
    } else if (activeSearchType === 'all') {
      // Use the general search query if available, otherwise try to find any filled field
      query = searchQuery.trim() || 
              searchFields.caseNumber.trim() || 
              searchFields.partyName.trim() || 
              searchFields.defendantName.trim() || 
              searchFields.complainantName.trim() || 
              searchFields.attorneyName.trim()
    }

    if (!query) return

    setIsSearching(true)
    
    try {
      // Real API call to search for cases
      const response = await fetch('/api/cases/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          query: query,
          searchType: searchType
        })
      })

      if (response.ok) {
        const data = await response.json()
        const cases = data.cases || []
        setSearchResults(cases)
        
        // Show message if no matches found
        if (cases.length === 0) {
          console.log('No matches found for search query:', query)
        }
      } else {
        // API search failed
        console.log('API search failed')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to empty results
      setSearchResults([])
    }
    
    setIsSearching(false)

    // Save search to user profile in localStorage
    try {
      userProfileManager.addRecentSearch(user.id, {
        query: query,
        searchType: searchType,
        resultsCount: searchResults.length
      })
      refreshProfile()
    } catch (error) {
      console.error('Failed to save search to localStorage:', error)
    }
  }

  const handleGetCaseDetails = async (case_: CaseResult) => {
    // Check monthly usage for basic users
    if (isBasicUser && monthlyUsage >= maxMonthlyUsage) {
      setShowUpgradeModal(true)
      return
    }

    setIsSearching(true)
    
    try {
      // Get REAL case data from our API
      const response = await fetch('/api/cases/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || 'test-user'}`
        },
        body: JSON.stringify({
          query: case_.caseNumber,
          searchType: 'caseNumber'
        })
      })
      
      if (response.ok) {
        const searchData = await response.json()
        const realCaseData = searchData.cases?.[0]
        
        if (realCaseData) {
          // Create detailed case object with REAL data from our API
          const detailedCase = {
            ...case_,
            detailedInfo: {
              caseHistory: realCaseData.countyData?.registerOfActions?.map(action => ({
                date: action.date,
                event: action.action,
                description: action.description,
                documents: []
              })) || [],
              upcomingHearings: realCaseData.countyData?.upcomingEvents?.map(event => ({
                date: event.date,
                time: event.time,
                type: event.eventType,
                location: event.department,
                virtualMeeting: event.virtualInfo ? `Zoom ID: ${event.virtualInfo.zoomId}` : undefined
              })) || [],
              documents: [],
              parties: {
                plaintiff: {
                  name: realCaseData.parties?.plaintiff || 'Unknown',
                  attorney: 'Legal Representative',
                  contact: 'attorney@example.com'
                },
                defendant: {
                  name: realCaseData.parties?.defendant || 'Unknown',
                  attorney: 'Legal Representative',
                  contact: 'attorney@example.com'
                }
              },
              filedDate: realCaseData.dateFiled || new Date().toISOString().split('T')[0],
              caseType: realCaseData.caseType || 'Family Law'
            }
          }
          
          setCaseDetails(detailedCase)
          setShowCaseDetails(true)
        } else {
          // Fallback to basic case data if no real data found
          const detailedCase = {
            ...case_,
            detailedInfo: {
              caseHistory: [],
              upcomingHearings: [],
              documents: [],
              parties: {
                plaintiff: {
                  name: 'Unknown',
                  attorney: 'Legal Representative',
                  contact: 'attorney@example.com'
                },
                defendant: {
                  name: 'Unknown',
                  attorney: 'Legal Representative',
                  contact: 'attorney@example.com'
                }
              },
              filedDate: new Date().toISOString().split('T')[0],
              caseType: 'Family Law'
            }
          }
          
          setCaseDetails(detailedCase)
          setShowCaseDetails(true)
        }
      } else {
        console.error('Failed to fetch real case data:', response.status)
        // Fallback to basic case data
        const detailedCase = {
          ...case_,
          detailedInfo: {
            caseHistory: [],
            upcomingHearings: [],
            documents: [],
            parties: {
              plaintiff: {
                name: 'Unknown',
                attorney: 'Legal Representative',
                contact: 'attorney@example.com'
              },
              defendant: {
                name: 'Unknown',
                attorney: 'Legal Representative',
                contact: 'attorney@example.com'
              }
            },
            filedDate: new Date().toISOString().split('T')[0],
            caseType: 'Family Law'
          }
        }
        
        setCaseDetails(detailedCase)
        setShowCaseDetails(true)
      }
    } catch (error) {
      console.error('Error fetching case details:', error)
      // Fallback to basic case data
      const detailedCase = {
        ...case_,
        detailedInfo: {
          caseHistory: [],
          upcomingHearings: [],
          documents: [],
          parties: {
            plaintiff: {
              name: 'Unknown',
              attorney: 'Legal Representative',
              contact: 'attorney@example.com'
            },
            defendant: {
              name: 'Unknown',
              attorney: 'Legal Representative',
              contact: 'attorney@example.com'
            }
          },
          filedDate: new Date().toISOString().split('T')[0],
          caseType: 'Family Law'
        }
      }
      
      setCaseDetails(detailedCase)
      setShowCaseDetails(true)
    }
    
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
    try {
      console.log('handleCaseClick called with:', case_)
      
      if (!isProUser && !case_.isDetailed) {
        setShowUpgradeModal(true)
        return
      }
      
      console.log('Setting selected case:', case_)
      setSelectedCase(case_)
    } catch (error) {
      console.error('Error in handleCaseClick:', error)
    }
  }


  const handleAddToCalendar = async (case_: CaseResult) => {
    if (!user) return
    
    // Check plan limits for free users
    if (isBasicUser && monthlyUsage >= maxMonthlyUsage) {
      setShowUpgradeModal(true)
      return
    }
    
    // Save case to user profile in database
    try {
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
      
      await refreshProfile()
      alert(`Case ${case_.caseNumber} and hearing added to your calendar!`)
    } catch (error) {
      console.error('Failed to save case and calendar event to database:', error)
    }
  }

  const handleStarCase = async (case_: CaseResult) => {
    if (!user) return
    
    // Check plan limits for free users
    if (isBasicUser && monthlyUsage >= maxMonthlyUsage) {
      setShowUpgradeModal(true)
      return
    }
    
    try {
      // First, save the case to savedCases if it's not already there
      const isAlreadySaved = userProfile?.savedCases?.some(c => c.id === case_.id)
      if (!isAlreadySaved) {
        const savedCaseData = {
          caseNumber: case_.caseNumber,
          caseTitle: case_.title,
          caseType: 'Family Law', // Default type
          caseStatus: case_.status,
          dateFiled: new Date().toISOString(),
          court: case_.court,
          judge: case_.judge,
          parties: {
            petitioner: case_.parties.plaintiff,
            respondent: case_.parties.defendant
          }
        }
        userProfileManager.addSavedCase(user.id, savedCaseData)
      }
      
      // Toggle star status
      const isStarred = userProfileManager.toggleStarredCase(user.id, case_.id)
      await refreshProfile()
      
      if (isStarred) {
        alert(`Case ${case_.caseNumber} starred!`)
      } else {
        alert(`Case ${case_.caseNumber} unstarred!`)
      }
    } catch (error) {
      console.error('Failed to toggle star status:', error)
    }
  }

  // Don't render anything if not logged in
  if (!user) return null

  ;
  return (
    <main 
      className="min-h-screen animated-aura pb-20 lg:pb-10"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '16px 12px 40px 12px'
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
            <div className="flex border-b border-white/10 mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === 'search'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-search text-sm"></i>
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === 'saved'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-folder-open text-sm"></i>
                <span className="hidden sm:inline">Saved</span>
                <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full text-xs">
                  {userProfile?.savedCases?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === 'recent'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-clock-rotate-left text-sm"></i>
                <span className="hidden sm:inline">Recent</span>
                <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full text-xs">
                  {userProfile?.recentSearches?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('starred')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === 'starred'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-star text-sm"></i>
                <span className="hidden sm:inline">Starred</span>
                <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full text-xs">
                  {userProfile?.starredCases?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'search' && (
              <>
                {/* Enhanced Search Form */}
                <div className="apple-card p-4 md:p-6 mb-4 md:mb-6">
                  <div className="mb-6">
                    <h3 className="text-white text-lg font-semibold mb-4">Search Cases</h3>
                    
                    {/* Search Type Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[
                        { key: 'all', label: 'All', icon: 'fa-search' },
                        { key: 'caseNumber', label: 'Case Number', icon: 'fa-hashtag' },
                        { key: 'partyName', label: 'Party Name', icon: 'fa-user' },
                        { key: 'defendantName', label: 'Defendant', icon: 'fa-user-minus' },
                        { key: 'complainantName', label: 'Complainant', icon: 'fa-user-plus' },
                        { key: 'attorneyName', label: 'Attorney', icon: 'fa-gavel' }
                      ].map(({ key, label, icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveSearchType(key as any)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            activeSearchType === key
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <i className={`fa-solid ${icon}`}></i>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Search Fields */}
                    <form onSubmit={handleSearch} className="space-y-4">
                      {/* General Search (when "All" is selected) */}
                      {activeSearchType === 'all' && (
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by any field - case number, party name, attorney, etc..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-base min-h-[48px] focus:ring-2 focus:ring-blue-500/20"
                          />
                          <i className="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                            <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Ctrl+K</kbd>
                          </div>
                        </div>
                      )}

                      {/* Case Number Search */}
                      {activeSearchType === 'caseNumber' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <label className="block text-gray-300 text-sm font-medium mb-2">Case Number</label>
                            <input
                              type="text"
                              value={searchFields.caseNumber}
                              onChange={(e) => setSearchFields(prev => ({ ...prev, caseNumber: e.target.value }))}
                              placeholder="e.g., 22FL001581C, 23CV123456"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-base min-h-[48px] focus:ring-2 focus:ring-blue-500/20"
                            />
                            <i className="fa-solid fa-hashtag absolute right-4 top-8 transform -translate-y-1/2 text-gray-400"></i>
                          </div>
                        </div>
                      )}

                      {/* Party Name Search */}
                      {activeSearchType === 'partyName' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <label className="block text-gray-300 text-sm font-medium mb-2">Party Name</label>
                            <input
                              type="text"
                              value={searchFields.partyName}
                              onChange={(e) => setSearchFields(prev => ({ ...prev, partyName: e.target.value }))}
                              placeholder="e.g., John Smith, Jane Doe"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-base min-h-[48px] focus:ring-2 focus:ring-blue-500/20"
                            />
                            <i className="fa-solid fa-user absolute right-4 top-8 transform -translate-y-1/2 text-gray-400"></i>
                          </div>
                        </div>
                      )}

                      {/* Defendant Name Search */}
                      {activeSearchType === 'defendantName' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <label className="block text-gray-300 text-sm font-medium mb-2">Defendant Name</label>
                            <input
                              type="text"
                              value={searchFields.defendantName}
                              onChange={(e) => setSearchFields(prev => ({ ...prev, defendantName: e.target.value }))}
                              placeholder="e.g., John Smith, ABC Corporation"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-base min-h-[48px] focus:ring-2 focus:ring-blue-500/20"
                            />
                            <i className="fa-solid fa-user-minus absolute right-4 top-8 transform -translate-y-1/2 text-gray-400"></i>
                          </div>
                        </div>
                      )}

                      {/* Complainant Name Search */}
                      {activeSearchType === 'complainantName' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <label className="block text-gray-300 text-sm font-medium mb-2">Complainant Name</label>
                            <input
                              type="text"
                              value={searchFields.complainantName}
                              onChange={(e) => setSearchFields(prev => ({ ...prev, complainantName: e.target.value }))}
                              placeholder="e.g., Jane Doe, State of California"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-base min-h-[48px] focus:ring-2 focus:ring-blue-500/20"
                            />
                            <i className="fa-solid fa-user-plus absolute right-4 top-8 transform -translate-y-1/2 text-gray-400"></i>
                          </div>
                        </div>
                      )}

                      {/* Attorney Name Search */}
                      {activeSearchType === 'attorneyName' && (
                        <div className="space-y-4">
                          <div className="relative">
                            <label className="block text-gray-300 text-sm font-medium mb-2">Attorney Name</label>
                            <input
                              type="text"
                              value={searchFields.attorneyName}
                              onChange={(e) => setSearchFields(prev => ({ ...prev, attorneyName: e.target.value }))}
                              placeholder="e.g., Smith & Associates, John Attorney"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-base min-h-[48px] focus:ring-2 focus:ring-blue-500/20"
                            />
                            <i className="fa-solid fa-gavel absolute right-4 top-8 transform -translate-y-1/2 text-gray-400"></i>
                          </div>
                        </div>
                      )}

                      {/* Advanced Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Case Type (Optional)</label>
                          <select
                            value={searchFields.caseType}
                            onChange={(e) => setSearchFields(prev => ({ ...prev, caseType: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-base min-h-[48px] focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="">All Case Types</option>
                            <option value="Family Law">Family Law</option>
                            <option value="Civil">Civil</option>
                            <option value="Criminal">Criminal</option>
                            <option value="Probate">Probate</option>
                            <option value="Small Claims">Small Claims</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Date Range (Optional)</label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={searchFields.dateRange.start}
                              onChange={(e) => setSearchFields(prev => ({ 
                                ...prev, 
                                dateRange: { ...prev.dateRange, start: e.target.value }
                              }))}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                              placeholder="Start Date"
                            />
                            <input
                              type="date"
                              value={searchFields.dateRange.end}
                              onChange={(e) => setSearchFields(prev => ({ 
                                ...prev, 
                                dateRange: { ...prev.dateRange, end: e.target.value }
                              }))}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                              placeholder="End Date"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Search Button */}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSearching}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
                        >
                          {isSearching ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Searching...</span>
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-search"></i>
                              <span>Search Cases</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

        {/* Search Results */}
        {isSearching && (
          <div className="apple-card p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-white text-xl font-semibold mb-2">Searching Cases...</h3>
            <p className="text-gray-400">Please wait while we search the court records</p>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-semibold">Search Results</h2>
              <span className="text-gray-400 text-sm">{searchResults.length} case{searchResults.length !== 1 ? 's' : ''} found</span>
            </div>
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
        ) : null}

        {!isSearching && searchResults.length === 0 && (searchQuery || Object.values(searchFields).some(field => typeof field === 'string' ? field.trim() : false)) && (
          <div className="apple-card p-8 text-center">
            <i className="fa-solid fa-search text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-white text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-gray-400 mb-4">No cases found for your search. Try adjusting your search terms or search criteria.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => {
                  setActiveSearchType('all')
                  setSearchQuery('')
                  setSearchFields({
                    caseNumber: '',
                    partyName: '',
                    defendantName: '',
                    complainantName: '',
                    attorneyName: '',
                    caseType: '',
                    dateRange: { start: '', end: '' }
                  })
                }}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm transition-all duration-200"
              >
                Clear Search
              </button>
              <button
                onClick={() => setActiveSearchType('caseNumber')}
                className="bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm transition-all duration-200"
              >
                Try Case Number
              </button>
            </div>
          </div>
        )}
              </>
            )}

            {/* Saved Cases Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <h2 className="text-white text-2xl font-semibold mb-4">Saved Cases</h2>
                {isBasicUser && monthlyUsage >= maxMonthlyUsage ? (
                  <div className="apple-card p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-lock text-yellow-400 text-2xl"></i>
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">Upgrade Required</h3>
                    <p className="text-gray-400 mb-6">You've reached your monthly limit. Upgrade to Pro to access saved cases.</p>
                    <button
                      onClick={() => router.push('/billing')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                ) : userProfile?.savedCases && userProfile.savedCases.length > 0 ? (
                  <div className="space-y-4">
                    {userProfile.savedCases.map((case_) => (
                      <div
                        key={case_.id}
                        onClick={() => handleCaseClick(case_)}
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
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 mb-2">
                    Debug: starredCases={JSON.stringify(userProfile?.starredCases)}, savedCases={userProfile?.savedCases?.length || 0}
                  </div>
                )}
                {isBasicUser && monthlyUsage >= maxMonthlyUsage ? (
                  <div className="apple-card p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-lock text-yellow-400 text-2xl"></i>
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">Upgrade Required</h3>
                    <p className="text-gray-400 mb-6">You've reached your monthly limit. Upgrade to Pro to access starred cases.</p>
                    <button
                      onClick={() => router.push('/billing')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                ) : userProfile?.starredCases && userProfile.starredCases.length > 0 ? (
                  <div className="space-y-4">
                    {userProfile.starredCases.map((caseId) => {
                      const case_ = userProfile.savedCases?.find(c => c.id === caseId)
                      if (!case_) {
                        console.warn(`Starred case ${caseId} not found in savedCases`)
                        // Create a basic case display for starred cases not in savedCases
                        return (
                          <div
                            key={caseId}
                            onClick={() => handleCaseClick({ 
                              id: caseId, 
                              caseNumber: caseId, 
                              title: `Case ${caseId}`,
                              court: 'San Diego Superior Court',
                              judge: 'Hon. Rebecca Kanter',
                              status: 'Active',
                              lastActivity: 'Recently starred',
                              parties: { plaintiff: 'Unknown', defendant: 'Unknown' },
                              documents: 0,
                              hearings: 0,
                              isDetailed: true
                            })}
                            className="apple-card p-6 hover-lift cursor-pointer transition-all duration-200"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                                  Case {caseId}
                                  <i className="fa-solid fa-star text-yellow-400"></i>
                                </h3>
                                <p className="text-blue-300 font-medium">{caseId}</p>
                              </div>
                              <div className="text-right">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                                  Unknown Status
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Case Type</p>
                                <p className="text-white">Unknown</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Date Filed</p>
                                <p className="text-white">Unknown</p>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      
                      // Convert SavedCase to CaseResult for handleCaseClick
                      const caseResult: CaseResult = {
                        id: case_.id,
                        caseNumber: case_.caseNumber,
                        title: case_.caseTitle,
                        court: case_.court,
                        judge: case_.judge,
                        status: case_.caseStatus,
                        lastActivity: new Date(case_.savedAt).toLocaleDateString(),
                        parties: {
                          plaintiff: case_.parties.petitioner,
                          defendant: case_.parties.respondent
                        },
                        documents: 0,
                        hearings: 0,
                        isDetailed: true
                      }
                      
                      return (
                        <div
                          key={case_.id}
                          onClick={() => handleCaseClick(caseResult)}
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
                    }).filter(Boolean)}
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
                <SimpleErrorBoundary>
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
                </SimpleErrorBoundary>
                <SimpleErrorBoundary>
                  <CaseTimeline 
                    caseNumber={selectedCase.caseNumber}
                    className="mb-6"
                  />
                </SimpleErrorBoundary>
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
            <div className="apple-card p-6 mb-6">
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
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Starred cases</span>
                  <span className="text-white font-semibold">{userProfile?.starredCases?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="apple-card p-6 mb-6">
              <h3 className="text-white font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActiveSearchType('caseNumber')
                    setSearchFields(prev => ({ ...prev, caseNumber: '' }))
                  }}
                  className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3"
                >
                  <i className="fa-solid fa-hashtag"></i>
                  <span>Search by Case Number</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSearchType('partyName')
                    setSearchFields(prev => ({ ...prev, partyName: '' }))
                  }}
                  className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3"
                >
                  <i className="fa-solid fa-user"></i>
                  <span>Search by Party Name</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSearchType('attorneyName')
                    setSearchFields(prev => ({ ...prev, attorneyName: '' }))
                  }}
                  className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3"
                >
                  <i className="fa-solid fa-gavel"></i>
                  <span>Search by Attorney</span>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="apple-card p-6">
              <h3 className="text-white font-semibold text-lg mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">San Diego County Court</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-400 text-sm">Maintenance</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ROASearch Platform</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-400 text-sm">Offline</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">CourtIndex Platform</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-400 text-sm">Offline</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Enhanced Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-info-circle text-yellow-400 text-sm mt-0.5"></i>
                  <div className="text-yellow-300 text-sm">
                    <p className="font-medium mb-1">Court Systems Maintenance</p>
                    <p>San Diego County court systems are currently undergoing maintenance. We're using our enhanced database to provide case information until they're back online.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-16 sm:pt-32">
            <div className="apple-card p-4 sm:p-8 max-w-md w-full mx-4 sm:mx-0">
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main 
        className="min-h-screen animated-aura"
        style={{
          background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
          padding: '40px 24px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading search page...</p>
          </div>
        </div>
      </main>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
