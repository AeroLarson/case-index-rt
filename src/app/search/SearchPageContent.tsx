'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userProfileManager } from '@/lib/userProfile'
import AIOverview from '@/components/AIOverview'

interface CaseResult {
  id: string
  caseNumber: string
  title: string
  court: string
  judge: string
  status: string
  lastActivity: string
  parties: { plaintiff: string; defendant: string }
  documents: number
  hearings: number
  isDetailed: boolean
  caseType?: string
  dateFiled?: string
  department?: string
  countyData?: {
    registerOfActions?: Array<{ date: string; action: string; description: string }>
    upcomingEvents?: Array<{ date: string; time: string; eventType: string; description: string }>
  }
}

export default function SearchPageContent() {
  const { user, isLoading, userProfile, refreshProfile } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<CaseResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      // Let the parent layout handle redirect; render nothing here
    }
  }, [isLoading, user])

  // Auto-detect search type: case number vs name
  const detectSearchType = (query: string): 'caseNumber' | 'name' => {
    const trimmed = query.trim()
    // Check if it looks like a case number (e.g., 22FL001581C, FL-2024-123456, etc.)
    if (/^\d{2}[A-Z]{2}\d{6}[A-Z]?$/.test(trimmed) || /^[A-Z]{2}-\d{4}-\d{4,8}$/i.test(trimmed)) {
      return 'caseNumber'
    }
    return 'name'
  }

  const performSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!user) return
    
    const query = searchQuery.trim()
    if (!query) {
      setError('Please enter a case number or name to search')
      return
    }
    
    const searchType = detectSearchType(query)
    
    setLoading(true)
    setError(null)
    setResults([])
    
    try {
      console.log('🔍 Searching for:', query, 'Type:', searchType)
      const res = await fetch('/api/cases/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.id}` },
        body: JSON.stringify({ query, searchType })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      
      const data = await res.json()
      console.log('📊 Search response:', data)
      
      if (data.cases && Array.isArray(data.cases)) {
        setResults(data.cases)
        if (data.cases.length === 0) {
          setError('No cases found. Try a different search term or check the spelling.')
        }
      } else {
        setResults([])
        setError('No results returned from search')
      }
    } catch (err: any) {
      console.error('❌ Search error:', err)
      setResults([])
      setError(err?.message || 'Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const clearForm = () => {
    setSearchQuery('')
    setResults([])
    setError(null)
  }

  const saveCase = (c: CaseResult) => {
    if (!user) return
    try {
      // Check if case is already saved
      const profile = userProfileManager.getUserProfile(user.id, user.name || '', user.email || '')
      const isAlreadySaved = profile.savedCases.some(saved => saved.caseNumber === c.caseNumber)
      
      if (isAlreadySaved) {
        alert('This case is already saved to your profile')
        return
      }

      userProfileManager.addSavedCase(user.id, {
        caseNumber: c.caseNumber,
        caseTitle: c.title,
        caseType: c.caseType || 'Unknown',
        caseStatus: c.status,
        dateFiled: c.dateFiled || new Date().toISOString(),
        court: c.court,
        judge: c.judge,
        parties: { petitioner: c.parties.plaintiff, respondent: c.parties.defendant }
      })
      
      refreshProfile()
      alert('Case saved successfully!')
    } catch (e) {
      console.error(e)
      alert('Failed to save case. Please try again.')
    }
  }

  const addToCalendar = (c: CaseResult) => {
    if (!user) return
    try {
      // First save the case if not already saved
      const profile = userProfileManager.getUserProfile(user.id, user.name || '', user.email || '')
      const isAlreadySaved = profile.savedCases.some(saved => saved.caseNumber === c.caseNumber)
      
      if (!isAlreadySaved) {
        saveCase(c)
      }

      // Add calendar events from real upcoming events
      const upcomingEvents = c.countyData?.upcomingEvents || []
      
      if (upcomingEvents.length > 0) {
        // Add each upcoming event to calendar with real dates
        upcomingEvents.forEach((event) => {
          // Parse the date - handle different formats
          let eventDate = event.date
          if (eventDate && !eventDate.includes('T')) {
            // If it's just a date string, ensure it's in YYYY-MM-DD format
            try {
              const parsedDate = new Date(eventDate)
              if (!isNaN(parsedDate.getTime())) {
                eventDate = parsedDate.toISOString().split('T')[0]
              }
            } catch (e) {
              console.warn('Could not parse event date:', eventDate)
            }
          }

          userProfileManager.addCalendarEvent(user.id, {
            title: `${event.eventType || 'Hearing'} - ${c.title}`,
            date: eventDate || new Date().toISOString().split('T')[0],
            time: event.time || '09:00',
            type: 'hearing',
            caseNumber: c.caseNumber,
            location: c.court,
            description: event.description || `Auto-added from search result for ${c.caseNumber}`,
            duration: 60,
            priority: 'normal',
            status: 'scheduled'
          })
        })
        refreshProfile()
        alert(`Added ${upcomingEvents.length} event(s) to calendar with real dates!`)
      } else {
        // If no upcoming events, add a general case reminder using the date filed
        const dateFiled = c.dateFiled ? new Date(c.dateFiled).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        
        userProfileManager.addCalendarEvent(user.id, {
          title: `Case Reminder - ${c.title}`,
          date: dateFiled,
          time: '09:00',
          type: 'reminder',
          caseNumber: c.caseNumber,
          location: c.court,
          description: `Case reminder for ${c.caseNumber}. Filed on ${c.dateFiled || 'unknown date'}`,
          duration: 60,
          priority: 'normal',
          status: 'scheduled'
        })
        refreshProfile()
        alert('Added case reminder to calendar')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to add to calendar. Please try again.')
    }
  }

  return (
    <div
      role="main"
      className="min-h-screen animated-aura pb-20 lg:pb-10"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '40px 24px'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-4xl font-bold mb-3 flex items-center gap-3">
                <i className="fa-solid fa-search text-blue-400"></i>
                San Diego County Case Search
              </h1>
              <p className="text-gray-300 text-lg">Search by case number or party name to find case information, filings, and upcoming hearings</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          {userProfile && userProfile.savedCases && userProfile.savedCases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="apple-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-bookmark text-blue-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{userProfile.savedCases.length}</p>
                    <p className="text-gray-400 text-sm">Saved Cases</p>
                  </div>
                </div>
              </div>
              <div className="apple-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-calendar-check text-green-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{userProfile.calendarEvents?.length || 0}</p>
                    <p className="text-gray-400 text-sm">Upcoming Events</p>
                  </div>
                </div>
              </div>
              <div className="apple-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-bell text-purple-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{userProfile.notifications?.filter(n => !n.read).length || 0}</p>
                    <p className="text-gray-400 text-sm">Unread Notifications</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Search Bar */}
        <form onSubmit={performSearch} className="apple-card p-6 mb-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter case number (e.g., 22FL001581C, FL-2024-123456) or party name (e.g., John Smith)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-800 disabled:to-purple-900 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2 min-w-[140px] justify-center"
              >
                <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-search'} text-lg`}></i>
                {loading ? 'Searching…' : 'Search'}
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-lg font-medium border border-white/10 transition-colors"
                  disabled={loading}
                  title="Clear search"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              )}
            </div>
            
            {/* Search Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-lightbulb text-blue-400 mt-1"></i>
                <div className="flex-1">
                  <p className="text-blue-300 font-medium mb-2">Search Tips</p>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• <strong>Case Numbers:</strong> Use format like <code className="bg-white/10 px-1 rounded">22FL001581C</code> or <code className="bg-white/10 px-1 rounded">FL-2024-123456</code></li>
                    <li>• <strong>Party Names:</strong> Enter first name, last name, or full name (e.g., "John Smith" or "Smith")</li>
                    <li>• <strong>Auto-Detection:</strong> We'll automatically detect if you're searching by case number or name</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>

        {error && (
          <div className="apple-card p-4 mb-6 bg-red-500/10 border-red-500/20">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-exclamation-circle text-red-400"></i>
              <div>
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && results.length === 0 && searchQuery && !error && (
          <div className="apple-card p-8 text-center">
            <i className="fa-solid fa-search text-gray-500 text-4xl mb-4"></i>
            <p className="text-gray-300 text-lg font-medium mb-2">No matches found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search criteria or check the case number format</p>
          </div>
        )}

        {loading && (
          <div className="apple-card p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Searching San Diego County records…</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-white text-2xl font-semibold">
              Search Results ({results.length})
            </h2>
            <div className="text-gray-400 text-sm">
              <i className="fa-solid fa-info-circle mr-2"></i>
              Click "View Details" to see full case information, motions, and upcoming hearings
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {results.map((c) => (
            <div key={c.id} className="apple-card p-6 hover:bg-white/5 transition-all hover:shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{c.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          c.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                          c.status === 'Closed' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {c.status}
                        </span>
                        {c.caseType && (
                          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            {c.caseType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-hashtag text-blue-400 w-4"></i>
                      <span className="text-gray-300 font-mono">{c.caseNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-landmark text-purple-400 w-4"></i>
                      <span className="text-gray-300">{c.court}</span>
                    </div>
                    {c.judge && c.judge !== 'Unknown' && (
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-gavel text-yellow-400 w-4"></i>
                        <span className="text-gray-300">Judge: {c.judge}</span>
                      </div>
                    )}
                    {c.dateFiled && (
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-calendar text-green-400 w-4"></i>
                        <span className="text-gray-300">Filed: {new Date(c.dateFiled).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {c.parties && (c.parties.plaintiff || c.parties.defendant) && (
                    <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-gray-400 text-xs mb-1">Parties</p>
                      <p className="text-white text-sm">
                        <span className="font-medium">{c.parties.plaintiff || 'Unknown'}</span>
                        {' v. '}
                        <span className="font-medium">{c.parties.defendant || 'Unknown'}</span>
                      </p>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    {c.countyData?.registerOfActions && c.countyData.registerOfActions.length > 0 && (
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-file-lines text-blue-400"></i>
                        {c.countyData.registerOfActions.length} filing(s)
                      </span>
                    )}
                    {c.countyData?.upcomingEvents && c.countyData.upcomingEvents.length > 0 && (
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-calendar-days text-green-400"></i>
                        {c.countyData.upcomingEvents.length} event(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-white/10 flex-wrap">
                <button 
                  onClick={() => { setSelectedCase(c); setShowDetailsModal(true) }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-eye"></i>
                  View Details
                </button>
                <button 
                  onClick={() => addToCalendar(c)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-calendar-plus"></i>
                  Add to Calendar
                </button>
                <button 
                  onClick={() => saveCase(c)}
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-white/10 transition-colors flex items-center gap-2"
                  title="Save case to your profile"
                >
                  <i className="fa-solid fa-bookmark"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Details Modal */}
      {showDetailsModal && selectedCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-white text-2xl font-bold">Case Details</h2>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedCase(null) }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Case Header */}
              <div className="apple-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white text-xl font-semibold mb-2">{selectedCase.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-hashtag text-blue-400"></i>
                        {selectedCase.caseNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-landmark text-purple-400"></i>
                        {selectedCase.court}
                      </span>
                      {selectedCase.dateFiled && (
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-calendar text-green-400"></i>
                          Filed: {new Date(selectedCase.dateFiled).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        selectedCase.status === 'Active' ? 'bg-green-500/20 text-green-400' : 
                        selectedCase.status === 'Closed' ? 'bg-gray-500/20 text-gray-400' : 
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {selectedCase.status}
                      </span>
                      {selectedCase.caseType && (
                        <span className="px-3 py-1 rounded text-sm font-medium bg-purple-500/20 text-purple-400">
                          {selectedCase.caseType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedCase.parties && (selectedCase.parties.plaintiff || selectedCase.parties.defendant) && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Parties:</p>
                    <p className="text-white">
                      <span className="font-medium">{selectedCase.parties.plaintiff || 'Unknown'}</span>
                      {' v. '}
                      <span className="font-medium">{selectedCase.parties.defendant || 'Unknown'}</span>
                    </p>
                  </div>
                )}

                {selectedCase.judge && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Judge:</p>
                    <p className="text-white">{selectedCase.judge}</p>
                  </div>
                )}
              </div>

              {/* AI Overview */}
              <AIOverview
                caseId={selectedCase.caseNumber}
                caseTitle={selectedCase.title}
                caseStatus={selectedCase.status}
                court={selectedCase.court}
                judge={selectedCase.judge}
                parties={selectedCase.parties}
                countyData={selectedCase.countyData}
              />

              {/* Upcoming Events */}
              {selectedCase.countyData?.upcomingEvents && selectedCase.countyData.upcomingEvents.length > 0 && (
                <div className="apple-card p-6">
                  <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-calendar-days text-blue-400"></i>
                    Upcoming Events ({selectedCase.countyData.upcomingEvents.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedCase.countyData.upcomingEvents.map((event, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-white font-medium">{event.eventType || 'Hearing'}</p>
                              {event.virtualInfo && (
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                                  <i className="fa-solid fa-video mr-1"></i>
                                  Virtual
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <i className="fa-solid fa-calendar text-blue-400"></i>
                                {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}
                              </span>
                              {event.time && (
                                <span className="flex items-center gap-1">
                                  <i className="fa-solid fa-clock text-green-400"></i>
                                  {event.time}
                                </span>
                              )}
                              {event.virtualInfo && (
                                <div className="flex items-center gap-2 mt-2 w-full">
                                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 flex-1">
                                    <p className="text-purple-300 text-xs font-medium mb-1">Zoom Meeting</p>
                                    <p className="text-white text-sm font-mono">ID: {event.virtualInfo.zoomId}</p>
                                    {event.virtualInfo.passcode && (
                                      <p className="text-gray-400 text-xs mt-1">Passcode: {event.virtualInfo.passcode}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Register of Actions */}
              {selectedCase.countyData?.registerOfActions && selectedCase.countyData.registerOfActions.length > 0 && (
                <div className="apple-card p-6">
                  <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-file-lines text-purple-400"></i>
                    Register of Actions ({selectedCase.countyData.registerOfActions.length})
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedCase.countyData.registerOfActions.map((action, idx) => {
                      const isMotion = /motion|order|judgment|ruling/i.test(action.action || action.description)
                      const isFiling = /filed|filing|document/i.test(action.action || action.description)
                      const isHearing = /hearing|trial|conference/i.test(action.action || action.description)
                      
                      return (
                        <div key={idx} className={`bg-white/5 rounded-lg p-3 border ${
                          isMotion ? 'border-yellow-500/20 bg-yellow-500/5' :
                          isFiling ? 'border-blue-500/20 bg-blue-500/5' :
                          isHearing ? 'border-green-500/20 bg-green-500/5' :
                          'border-white/10'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isMotion && <i className="fa-solid fa-gavel text-yellow-400 text-xs"></i>}
                                {isFiling && <i className="fa-solid fa-file text-blue-400 text-xs"></i>}
                                {isHearing && <i className="fa-solid fa-calendar-check text-green-400 text-xs"></i>}
                                <p className="text-white text-sm font-medium">{action.action || 'Action'}</p>
                              </div>
                              <p className="text-gray-400 text-xs mt-1">{action.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>
                                  {action.date ? new Date(action.date).toLocaleDateString() : 'Date unknown'}
                                </span>
                                {action.filedBy && action.filedBy !== 'Unknown' && (
                                  <span className="text-gray-400">• Filed by: {action.filedBy}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button 
                  onClick={() => { saveCase(selectedCase); setShowDetailsModal(false) }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <i className="fa-solid fa-bookmark"></i>
                  Save Case
                </button>
                <button 
                  onClick={() => { addToCalendar(selectedCase); setShowDetailsModal(false) }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <i className="fa-solid fa-calendar-plus"></i>
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
