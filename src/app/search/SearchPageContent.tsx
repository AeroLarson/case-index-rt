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
  const [searchType, setSearchType] = useState<'caseNumber' | 'partyName' | 'defendantName'>('partyName')
  
  // Case Number Search
  const [caseNumber, setCaseNumber] = useState('')
  
  // Party Name Search (Plaintiff/Petitioner)
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  
  // Defendant Name Search
  const [defendantFirstName, setDefendantFirstName] = useState('')
  const [defendantMiddleName, setDefendantMiddleName] = useState('')
  const [defendantLastName, setDefendantLastName] = useState('')
  
  const [results, setResults] = useState<CaseResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      // Let the parent layout handle redirect; render nothing here
    }
  }, [isLoading, user])

  const performSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!user) return
    
    let query = ''
    let finalSearchType: 'caseNumber' | 'name' | 'attorney' = 'name'
    
    // Build query based on search type
    if (searchType === 'caseNumber') {
      if (!caseNumber.trim()) {
        setError('Please enter a case number')
        return
      }
      query = caseNumber.trim()
      finalSearchType = 'caseNumber'
    } else if (searchType === 'partyName') {
      if (!firstName.trim() && !lastName.trim()) {
        setError('Please enter at least a first or last name')
        return
      }
      const nameParts = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean)
      query = nameParts.join(' ')
      finalSearchType = 'name'
    } else if (searchType === 'defendantName') {
      if (!defendantFirstName.trim() && !defendantLastName.trim()) {
        setError('Please enter at least a first or last name')
        return
      }
      const nameParts = [defendantFirstName.trim(), defendantMiddleName.trim(), defendantLastName.trim()].filter(Boolean)
      query = nameParts.join(' ')
      finalSearchType = 'name'
    }
    
    if (!query) {
      setError('Please enter search criteria')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cases/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.id}` },
        body: JSON.stringify({ query: query.trim(), searchType: finalSearchType })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResults(data.cases || [])
    } catch (err: any) {
      setResults([])
      setError(err?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }
  
  const clearForm = () => {
    setCaseNumber('')
    setFirstName('')
    setMiddleName('')
    setLastName('')
    setDefendantFirstName('')
    setDefendantMiddleName('')
    setDefendantLastName('')
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
          <p className="text-gray-300 text-lg">Search for cases by case number, party name, or defendant name</p>
        </div>
      
        {/* Search Type Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => { setSearchType('caseNumber'); clearForm(); }}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              searchType === 'caseNumber'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-hashtag mr-2"></i>
            Case Number
          </button>
          <button
            onClick={() => { setSearchType('partyName'); clearForm(); }}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              searchType === 'partyName'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-user-tie mr-2"></i>
            Party Name
          </button>
          <button
            onClick={() => { setSearchType('defendantName'); clearForm(); }}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              searchType === 'defendantName'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-user-slash mr-2"></i>
            Defendant Name
          </button>
        </div>

      {/* Search Form */}
      <form onSubmit={performSearch} className="apple-card p-6 mb-6">
        {searchType === 'caseNumber' && (
          <div>
            <label className="block text-white font-medium mb-2">Case Number</label>
            <input
              type="text"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="e.g., 22FL001581C or FL-2024-123456"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-sm mt-2">Enter the case number (e.g., 22FL001581C, FL-2024-123456)</p>
          </div>
        )}

        {searchType === 'partyName' && (
          <div className="space-y-4">
            <h3 className="text-white font-medium mb-4">Party Name (Plaintiff/Petitioner)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Middle Name (Optional)</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Middle"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {searchType === 'defendantName' && (
          <div className="space-y-4">
            <h3 className="text-white font-medium mb-4">Defendant Name</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={defendantFirstName}
                  onChange={(e) => setDefendantFirstName(e.target.value)}
                  placeholder="First"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Middle Name (Optional)</label>
                <input
                  type="text"
                  value={defendantMiddleName}
                  onChange={(e) => setDefendantMiddleName(e.target.value)}
                  placeholder="Middle"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={defendantLastName}
                  onChange={(e) => setDefendantLastName(e.target.value)}
                  placeholder="Last"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-800 disabled:to-purple-900 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-search'} mr-2`}></i>
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium border border-white/10 transition-colors"
          >
            <i className="fa-solid fa-eraser mr-2"></i>
            Clear
          </button>
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

        {!loading && results.length === 0 && (caseNumber || firstName || lastName || defendantFirstName || defendantLastName) && (
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
