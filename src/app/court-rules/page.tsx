'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface CourtRule {
  id: string
  title: string
  ruleNumber: string
  category: string
  court: string
  content: string
  lastUpdated: string
  relatedRules?: string[]
}

export default function CourtRulesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourt, setSelectedCourt] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CourtRule[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  const courts = [
    'San Diego Superior Court',
    'California Superior Court',
    'Federal District Court',
    'All Courts'
  ]

  const categories = [
    'Civil Procedure',
    'Family Law',
    'Criminal Procedure',
    'Evidence',
    'Discovery',
    'Motion Practice',
    'All Categories'
  ]

  const performSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!user) return

    const query = searchQuery.trim()
    if (!query) {
      setResults([])
      return
    }

    setLoading(true)
    setResults([])
    setError(null)
    
    try {
      // Call the API endpoint to search court rules
      const response = await fetch('/api/court-rules/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          county: selectedCourt === 'all' ? 'san-diego' : selectedCourt.toLowerCase().replace(/\s+/g, '-'),
          practiceArea: selectedCategory === 'all' ? 'family-law' : selectedCategory.toLowerCase().replace(/\s+/g, '-'),
          searchQuery: query
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Search failed' }))
        throw new Error(errorData.error || `Search failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.results) {
        // Transform API results to our format
        const transformedResults: CourtRule[] = []
        
        // Add rules from results
        if (data.results.rules && Array.isArray(data.results.rules)) {
          data.results.rules.forEach((rule: string, index: number) => {
            transformedResults.push({
              id: `rule-${index}`,
              title: rule.split(',')[0] || rule,
              ruleNumber: rule.match(/Rule\s+[\d.]+/i)?.[0] || rule.match(/CCP\s+[\d.]+/i)?.[0] || 'N/A',
              category: selectedCategory === 'all' ? 'Civil Procedure' : selectedCategory,
              court: selectedCourt === 'all' ? 'California Superior Court' : selectedCourt,
              content: rule,
              lastUpdated: new Date().toISOString().split('T')[0]
            })
          })
        }
        
        // Add deadlines as rules if available
        if (data.results.deadlines && Array.isArray(data.results.deadlines)) {
          data.results.deadlines.forEach((deadline: string, index: number) => {
            transformedResults.push({
              id: `deadline-${index}`,
              title: deadline,
              ruleNumber: 'Deadline',
              category: 'Motion Practice',
              court: selectedCourt === 'all' ? 'California Superior Court' : selectedCourt,
              content: deadline,
              lastUpdated: new Date().toISOString().split('T')[0]
            })
          })
        }
        
        // If no results from API, provide some default helpful results
        if (transformedResults.length === 0) {
          const defaultResults: CourtRule[] = [
            {
              id: '1',
              title: 'Motion for Summary Judgment',
              ruleNumber: 'CCP 437c',
              category: 'Motion Practice',
              court: 'California Superior Court',
              content: 'A party may move for summary judgment in any action or proceeding if it is contended that the action has no merit or that there is no defense to the action or proceeding. The motion shall be supported by affidavits, declarations, admissions, answers to interrogatories, depositions, and matters of which judicial notice shall or may be taken.',
              lastUpdated: '2024-01-15',
              relatedRules: ['CCP 437c(a)', 'CCP 437c(b)']
            },
            {
              id: '2',
              title: 'Discovery Requests',
              ruleNumber: 'CCP 2031.010',
              category: 'Discovery',
              court: 'California Superior Court',
              content: 'Any party may obtain discovery by inspecting documents, tangible things, land or other property, and electronically stored information in the possession, custody, or control of any other party to the action.',
              lastUpdated: '2024-02-01'
            }
          ].filter(rule => 
            rule.title.toLowerCase().includes(query.toLowerCase()) ||
            rule.ruleNumber.toLowerCase().includes(query.toLowerCase()) ||
            rule.content.toLowerCase().includes(query.toLowerCase())
          )
          
          // Filter by court
          const filteredByCourt = selectedCourt === 'all' 
            ? defaultResults 
            : defaultResults.filter(r => r.court === selectedCourt)

          // Filter by category
          const filteredByCategory = selectedCategory === 'all'
            ? filteredByCourt
            : filteredByCourt.filter(r => r.category === selectedCategory)

          setResults(filteredByCategory)
        } else {
          // Filter transformed results
          const filteredByCourt = selectedCourt === 'all' 
            ? transformedResults 
            : transformedResults.filter(r => r.court === selectedCourt)

          const filteredByCategory = selectedCategory === 'all'
            ? filteredByCourt
            : filteredByCourt.filter(r => r.category === selectedCategory)

          setResults(filteredByCategory)
        }
      } else {
        setResults([])
      }
    } catch (error: any) {
      console.error('Court rules search error:', error)
      setError(error?.message || 'Failed to search court rules. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div
      className="min-h-screen animated-aura pb-20 lg:pb-10"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '40px 24px'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-3 flex items-center gap-3">
            <i className="fa-solid fa-book text-blue-400"></i>
            Court Rules Search
          </h1>
          <p className="text-gray-300 text-lg">Search California court rules, procedures, and regulations</p>
        </div>

        {/* Search Form */}
        <form onSubmit={performSearch} className="apple-card p-6 mb-6">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by rule number (e.g., CCP 437c) or keyword..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Court</label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {courts.map(court => (
                    <option key={court} value={court === 'All Courts' ? 'all' : court} className="bg-gray-900">
                      {court}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat === 'All Categories' ? 'all' : cat} className="bg-gray-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-800 disabled:to-purple-900 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-search'} text-lg`}></i>
              {loading ? 'Searching...' : 'Search Court Rules'}
            </button>
          </div>
        </form>

        {/* Error Message */}
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

        {/* Results */}
        {loading && (
          <div className="apple-card p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 font-medium mb-2">Searching court rules...</p>
            <p className="text-gray-400 text-sm">Querying California court rules database</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Search Results ({results.length})
            </h2>
          </div>
        )}

        <div className="space-y-4">
          {results.map((rule) => (
            <div key={rule.id} className="apple-card p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-xl">{rule.title}</h3>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                      {rule.ruleNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-landmark text-purple-400"></i>
                      {rule.court}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-tag text-green-400"></i>
                      {rule.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-calendar text-yellow-400"></i>
                      Updated: {new Date(rule.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{rule.content}</p>
                  {rule.relatedRules && rule.relatedRules.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-gray-400 text-sm mb-2">Related Rules:</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.relatedRules.map((related, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                            {related}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && searchQuery && results.length === 0 && (
          <div className="apple-card p-8 text-center">
            <i className="fa-solid fa-book text-gray-500 text-4xl mb-4"></i>
            <p className="text-gray-300 text-lg font-medium mb-2">No rules found</p>
            <p className="text-gray-400 text-sm">Try a different search term or check the rule number format</p>
          </div>
        )}
      </div>
    </div>
  )
}

