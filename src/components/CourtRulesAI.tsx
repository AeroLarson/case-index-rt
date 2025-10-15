'use client'

import { useState } from 'react'
import { searchCourtRules } from '@/lib/courtDataSync'

interface CourtRulesResult {
  deadlines: string[]
  rules: string[]
  pageNumbers: number[]
}

interface CourtRulesAIProps {
  caseNumber: string
  onResults: (results: CourtRulesResult) => void
}

export default function CourtRulesAI({ caseNumber, onResults }: CourtRulesAIProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [county, setCounty] = useState('san-diego')
  const [practiceArea, setPracticeArea] = useState('family')
  const [results, setResults] = useState<CourtRulesResult | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }

    setIsSearching(true)
    setError('')

    try {
      const response = await fetch('/api/court-rules/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          county,
          practiceArea,
          searchQuery
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        onResults(data.results)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (error) {
      console.error('Error searching court rules:', error)
      setError('Failed to search court rules')
    } finally {
      setIsSearching(false)
    }
  }

  const commonQueries = [
    'Request for Order response deadline',
    'Domestic Violence Restraining Order deadline',
    'Motion to Compel response time',
    'Discovery deadline',
    'Trial setting conference',
    'Case Management Conference'
  ]

  return (
    <div className="apple-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
          <i className="fa-solid fa-search text-white text-lg"></i>
        </div>
        <div>
          <h3 className="text-white text-xl font-semibold">Court Rules AI Search</h3>
          <p className="text-gray-400 text-sm">Search court rules and deadlines with AI</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">County</label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="san-diego" className="bg-gray-800 text-white">San Diego County</option>
              <option value="sonoma" className="bg-gray-800 text-white">Sonoma County</option>
              <option value="los-angeles" className="bg-gray-800 text-white">Los Angeles County</option>
              <option value="orange" className="bg-gray-800 text-white">Orange County</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Practice Area</label>
            <select
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="family" className="bg-gray-800 text-white">Family Law</option>
              <option value="probate" className="bg-gray-800 text-white">Probate</option>
              <option value="civil" className="bg-gray-800 text-white">Civil</option>
              <option value="criminal" className="bg-gray-800 text-white">Criminal</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Search Query</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., Request for Order response deadline"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Searching Court Rules...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-search"></i>
              <span>Search Court Rules</span>
            </>
          )}
        </button>
      </div>

      {/* Common Queries */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Common Searches:</h4>
        <div className="flex flex-wrap gap-2">
          {commonQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => setSearchQuery(query)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1 rounded-lg text-sm transition-all duration-200"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Deadlines */}
          {results.deadlines.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <i className="fa-solid fa-clock text-orange-400"></i>
                Found Deadlines
              </h4>
              <div className="space-y-2">
                {results.deadlines.map((deadline, index) => (
                  <div key={index} className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg">
                    <p className="text-orange-300 text-sm">{deadline}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {results.rules.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <i className="fa-solid fa-gavel text-blue-400"></i>
                Relevant Rules
              </h4>
              <div className="space-y-2">
                {results.rules.map((rule, index) => (
                  <div key={index} className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                    <p className="text-blue-300 text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Page Numbers */}
          {results.pageNumbers.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <i className="fa-solid fa-file-pdf text-green-400"></i>
                Reference Pages
              </h4>
              <div className="flex flex-wrap gap-2">
                {results.pageNumbers.map((page, index) => (
                  <span key={index} className="bg-green-500/10 border border-green-500/30 text-green-300 px-3 py-1 rounded-lg text-sm">
                    Page {page}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
