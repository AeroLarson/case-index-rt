'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userProfileManager } from '@/lib/userProfile'

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
}

export default function SearchPageContent() {
  const { user, isLoading, userProfile, refreshProfile } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<CaseResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const addToCalendar = (c: CaseResult) => {
    if (!user) return
    try {
      userProfileManager.addSavedCase(user.id, {
        caseNumber: c.caseNumber,
        caseTitle: c.title,
        caseType: 'Unknown',
        caseStatus: c.status,
        dateFiled: new Date().toISOString(),
        court: c.court,
        judge: c.judge,
        parties: { petitioner: c.parties.plaintiff, respondent: c.parties.defendant }
      })
      userProfileManager.addCalendarEvent(user.id, {
        title: `Hearing - ${c.title}`,
        date: new Date().toISOString().slice(0, 10),
        time: '09:00',
        type: 'hearing',
        caseNumber: c.caseNumber,
        location: c.court,
        description: 'Auto-added from search result',
        duration: 60,
        priority: 'normal',
        status: 'scheduled'
      })
      refreshProfile()
      alert('Saved and added to calendar')
    } catch (e) {
      console.error(e)
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
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-3 flex items-center gap-3">
            <i className="fa-solid fa-search text-blue-400"></i>
            San Diego County Case Search
          </h1>
          <p className="text-gray-300 text-lg">Search by case number (e.g., 22FL001581C) or party name (e.g., John Smith)</p>
        </div>

        {/* Single Search Bar */}
        <form onSubmit={performSearch} className="apple-card p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter case number (e.g., 22FL001581C) or name (e.g., John Smith)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-800 disabled:to-purple-900 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
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
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-3">
            <i className="fa-solid fa-info-circle mr-2"></i>
            We'll automatically detect if you're searching by case number or name
          </p>
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
          <div className="mb-6">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Search Results ({results.length})
            </h2>
          </div>
        )}

        <div className="space-y-4">
          {results.map((c) => (
            <div key={c.id} className="apple-card p-6 hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-white font-semibold text-lg">{c.title}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      c.status === 'Active' ? 'bg-green-500/20 text-green-400' : 
                      c.status === 'Closed' ? 'bg-gray-500/20 text-gray-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-hashtag text-blue-400"></i>
                      {c.caseNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-landmark text-purple-400"></i>
                      {c.court}
                    </span>
                  </div>
                  {c.parties && (c.parties.plaintiff || c.parties.defendant) && (
                    <div className="mt-2 text-sm text-gray-300">
                      <span className="text-gray-500">Parties: </span>
                      {c.parties.plaintiff || 'Unknown'} v. {c.parties.defendant || 'Unknown'}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button 
                  onClick={() => addToCalendar(c)} 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <i className="fa-solid fa-calendar-plus"></i>
                  Add to Calendar
                </button>
                <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/10 transition-colors">
                  <i className="fa-solid fa-bookmark mr-2"></i>
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
