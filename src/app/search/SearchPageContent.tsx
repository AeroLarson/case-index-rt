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
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'caseNumber' | 'name' | 'attorney'>('all')
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
    if (!user || !query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cases/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.id}` },
        body: JSON.stringify({ query: query.trim(), searchType })
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
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-white text-2xl font-bold mb-4">Case Search</h1>
      <form onSubmit={performSearch} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Case number or name"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
        >
          <option value="all">All</option>
          <option value="caseNumber">Case Number</option>
          <option value="name">Name</option>
          <option value="attorney">Attorney</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

      {!loading && results.length === 0 && query && (
        <div className="text-gray-300">No matches found</div>
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
