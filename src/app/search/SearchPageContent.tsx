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
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-white text-3xl font-bold mb-6">San Diego County Case Search</h1>
      
      {/* Search Type Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => { setSearchType('caseNumber'); clearForm(); }}
          className={`px-4 py-2 font-medium transition-colors ${
            searchType === 'caseNumber'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Case Number
        </button>
        <button
          onClick={() => { setSearchType('partyName'); clearForm(); }}
          className={`px-4 py-2 font-medium transition-colors ${
            searchType === 'partyName'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Party Name (Plaintiff/Petitioner)
        </button>
        <button
          onClick={() => { setSearchType('defendantName'); clearForm(); }}
          className={`px-4 py-2 font-medium transition-colors ${
            searchType === 'defendantName'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
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
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium border border-white/10 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

      {error && <div className="text-red-400 text-sm mb-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">{error}</div>}

      {!loading && results.length === 0 && (caseNumber || firstName || lastName || defendantFirstName || defendantLastName) && (
        <div className="text-gray-300 p-4 bg-white/5 rounded-lg border border-white/10">No matches found</div>
      )}

      <div className="space-y-3">
        {results.map((c) => (
          <div key={c.id} className="apple-card p-4">
            <div className="flex justify-between">
              <div>
                <div className="text-white font-semibold">{c.title}</div>
                <div className="text-blue-300 text-sm">{c.caseNumber}</div>
                <div className="text-gray-400 text-sm">{c.court}</div>
              </div>
              <div className="text-right">
                <span className="text-gray-300 text-sm">{c.status}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => addToCalendar(c)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm">Add to Calendar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
