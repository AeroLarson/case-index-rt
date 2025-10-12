'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SanDiegoCourtMiner, type SanDiegoCourtCase } from '@/lib/sanDiegoCourtAPI'

export default function DataMiningPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isMining, setIsMining] = useState(false)
  const [minedData, setMinedData] = useState<SanDiegoCourtCase | null>(null)
  const [searchResults, setSearchResults] = useState<SanDiegoCourtCase[]>([])
  const [searchQuery, setSearchQuery] = useState('Joseph Preston')
  const [searchType, setSearchType] = useState<'party' | 'case' | 'attorney'>('party')
  const [miningStatus, setMiningStatus] = useState<'idle' | 'mining' | 'success' | 'error'>('idle')
  const [courtMiner, setCourtMiner] = useState<SanDiegoCourtMiner | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    // Auto-initialize the court miner (you'll set up the API key internally)
    const initializeCourtMiner = () => {
      // This will be configured with your internal API key
      const miner = new SanDiegoCourtMiner('your-internal-api-key')
      setCourtMiner(miner)
      setIsConnected(true)
    }
    
    initializeCourtMiner()
  }, [user, router])

  const handleMineData = async () => {
    if (!courtMiner) {
      setMiningStatus('error')
      return
    }

    setIsMining(true)
    setMiningStatus('mining')
    
    try {
      let results: SanDiegoCourtCase[] = []
      
      if (searchType === 'party') {
        const nameParts = searchQuery.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts[nameParts.length - 1] || ''
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''
        
        results = await courtMiner.searchByPartyName(firstName, lastName, middleName)
      } else if (searchType === 'case') {
        const caseData = await courtMiner.searchByCaseNumber(searchQuery)
        if (caseData) {
          results = [caseData]
        }
      } else if (searchType === 'attorney') {
        results = await courtMiner.searchByAttorney(searchQuery)
      }
      
      setSearchResults(results)
      setMiningStatus('success')
    } catch (error) {
      console.error('Error mining data:', error)
      setMiningStatus('error')
    } finally {
      setIsMining(false)
    }
  }

  const handleSelectCase = async (caseData: SanDiegoCourtCase) => {
    if (!courtMiner) return
    
    try {
      const detailedCase = await courtMiner.getCaseDetails(caseData.caseNumber)
      if (detailedCase) {
        setMinedData(detailedCase)
      }
    } catch (error) {
      console.error('Error getting case details:', error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <main 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '40px 24px'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">San Diego Court Data Mining</h1>
          <p className="text-gray-300 text-lg">Extract comprehensive case data from San Diego Superior Court</p>
        </div>

        {/* API Status */}
        <div className="apple-card p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <i className="fa-solid fa-database text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-white text-2xl font-semibold">San Diego Court Data Mining</h3>
              <p className="text-gray-300">Automatically connected to San Diego Superior Court system</p>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="apple-card p-6 mb-8">
            <h3 className="text-white text-2xl font-semibold mb-6">Case Search & Data Extraction</h3>
            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by party name, case number, or attorney..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'party' | 'case' | 'attorney')}
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="party">Party Name</option>
                  <option value="case">Case Number</option>
                  <option value="attorney">Attorney</option>
                </select>
                <button
                  onClick={handleMineData}
                  disabled={isMining}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isMining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mining Data...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-database"></i>
                      Mine Court Data
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-building text-green-400"></i>
                <span className="text-gray-300">San Diego Superior Court</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-link text-green-400"></i>
                <span className="text-green-300">API Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-shield text-purple-400"></i>
                <span className="text-gray-300">Secure Data Transfer</span>
              </div>
            </div>
          </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="apple-card p-6 mb-8">
            <h3 className="text-white text-2xl font-semibold mb-6">Search Results</h3>
            <div className="space-y-4">
              {searchResults.map((case_, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectCase(case_)}
                  className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer transition-all duration-200 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-semibold text-lg">{case_.caseTitle}</h4>
                    <span className="text-blue-300 font-mono text-sm">{case_.caseNumber}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white ml-2">{case_.caseType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400 ml-2">{case_.caseStatus}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Filed:</span>
                      <span className="text-white ml-2">{new Date(case_.dateFiled).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mining Status */}
        {miningStatus === 'mining' && (
          <div className="apple-card p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h4 className="text-white font-semibold">Mining Court Data...</h4>
                <p className="text-gray-400 text-sm">Extracting case information from San Diego Superior Court</p>
              </div>
            </div>
          </div>
        )}

        {/* Mined Data Display */}
        {minedData && (
          <div className="space-y-8">
            {/* Case Overview */}
            <div className="apple-card p-8">
              <h3 className="text-white text-2xl font-semibold mb-6">Case Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-4">Case Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Case Number:</span>
                      <span className="text-blue-300 font-mono">{minedData.caseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Case Type:</span>
                      <span className="text-white">{minedData.caseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400">{minedData.caseStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date Filed:</span>
                      <span className="text-white">{new Date(minedData.dateFiled).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Department:</span>
                      <span className="text-white">{minedData.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Court Location:</span>
                      <span className="text-white">{minedData.courtLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Judge:</span>
                      <span className="text-white">{minedData.judicialOfficer}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-4">Parties & Attorneys</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Petitioner</p>
                      <p className="text-white">{minedData.parties.petitioner}</p>
                      {minedData.parties.petitionerAttorney && (
                        <p className="text-blue-300 text-sm">{minedData.parties.petitionerAttorney}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Respondent</p>
                      <p className="text-white">{minedData.parties.respondent}</p>
                      {minedData.parties.respondentAttorney && (
                        <p className="text-blue-300 text-sm">{minedData.parties.respondentAttorney}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Hearings */}
            {minedData.upcomingHearings.length > 0 && (
              <div className="apple-card p-8">
                <h3 className="text-white text-2xl font-semibold mb-6">Upcoming Hearings</h3>
                <div className="space-y-4">
                  {minedData.upcomingHearings.map((hearing, index) => (
                    <div key={index} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-semibold text-lg">{hearing.type}</h4>
                          <p className="text-gray-300">{hearing.location}</p>
                        </div>
                        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                          {hearing.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-calendar text-blue-400"></i>
                          <span className="text-gray-300">{new Date(hearing.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-clock text-blue-400"></i>
                          <span className="text-gray-300">{hearing.time}</span>
                        </div>
                        {hearing.virtualMeeting && (
                          <div className="flex items-center gap-3 md:col-span-2">
                            <i className="fa-solid fa-video text-green-400"></i>
                            <span className="text-green-300">{hearing.virtualMeeting}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Register of Actions */}
            {minedData.registerOfActions.length > 0 && (
              <div className="apple-card p-8">
                <h3 className="text-white text-2xl font-semibold mb-6">Case Timeline</h3>
                <div className="space-y-4">
                  {minedData.registerOfActions.slice(0, 10).map((action, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-file text-white text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-semibold">{action.eventType}</h4>
                          <span className="text-gray-400 text-sm">{new Date(action.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{action.description}</p>
                        {action.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {action.documents.map((doc, docIndex) => (
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
            )}

            {/* Data Export Options */}
            <div className="apple-card p-8">
              <h3 className="text-white text-2xl font-semibold mb-6">Export Mined Data</h3>
              <div className="flex gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200">
                  <i className="fa-solid fa-download mr-2"></i>
                  Export to Calendar
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200">
                  <i className="fa-solid fa-file-pdf mr-2"></i>
                  Generate Report
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200">
                  <i className="fa-solid fa-share mr-2"></i>
                  Share with Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}