'use client'

import { useState, useEffect } from 'react'
import CourtRulesAI from './CourtRulesAI'
import CaseMonitor from './CaseMonitor'
import DocumentManager from './DocumentManager'
import AIOverview from './AIOverview'

interface CaseDetails {
  caseNumber: string
  title: string
  status: string
  filedDate: string
  caseType: string
  county: string
  judge?: string
  department?: string
  nextHearing?: {
    date: string
    time: string
    type: string
    location: string
    virtualLinks?: {
      zoom?: string
      teams?: string
    }
  }
  tentativeRulings?: Array<{
    date: string
    ruling: string
    type: string
  }>
  documentOrderingUrl?: string
}

interface EnhancedCaseDetailsProps {
  caseDetails: CaseDetails
  onClose: () => void
}

export default function EnhancedCaseDetails({ caseDetails, onClose }: EnhancedCaseDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [courtRulesResults, setCourtRulesResults] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleCourtRulesResults = (results: any) => {
    setCourtRulesResults(results)
  }

  const handleSyncHearings = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/court-sync/hearings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user', // This would come from auth context
          caseNumbers: [caseDetails.caseNumber]
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Hearings synced:', data.hearings)
        // Update UI with new hearing data
      }
    } catch (error) {
      console.error('Error syncing hearings:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSyncTentativeRulings = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/court-sync/tentative-rulings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user',
          caseNumbers: [caseDetails.caseNumber]
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Tentative rulings synced:', data.rulings)
        // Update UI with new ruling data
      }
    } catch (error) {
      console.error('Error syncing tentative rulings:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-info-circle' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: 'fa-robot' },
    { id: 'hearings', label: 'Hearings', icon: 'fa-calendar' },
    { id: 'rulings', label: 'Tentative Rulings', icon: 'fa-gavel' },
    { id: 'documents', label: 'Documents', icon: 'fa-file' },
    { id: 'court-rules', label: 'Court Rules', icon: 'fa-search' },
    { id: 'monitoring', label: 'Monitoring', icon: 'fa-eye' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
      <div className="apple-card p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-white text-3xl font-bold mb-2">{caseDetails.caseNumber}</h2>
            <p className="text-gray-300 text-lg">{caseDetails.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Case Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white">{caseDetails.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Filed Date:</span>
                      <span className="text-white">{caseDetails.filedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Case Type:</span>
                      <span className="text-white">{caseDetails.caseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">County:</span>
                      <span className="text-white">{caseDetails.county}</span>
                    </div>
                    {caseDetails.judge && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Judge:</span>
                        <span className="text-white">{caseDetails.judge}</span>
                      </div>
                    )}
                  </div>
                </div>

                {caseDetails.nextHearing && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Next Hearing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white">{caseDetails.nextHearing.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white">{caseDetails.nextHearing.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{caseDetails.nextHearing.type}</span>
                      </div>
                      {caseDetails.nextHearing.virtualLinks?.zoom && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Zoom:</span>
                          <a href={caseDetails.nextHearing.virtualLinks.zoom} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleSyncHearings}
                      disabled={isSyncing}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isSyncing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-sync"></i>
                          <span>Sync Latest Hearings</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSyncTentativeRulings}
                      disabled={isSyncing}
                      className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-gavel"></i>
                      <span>Check Tentative Rulings</span>
                    </button>

                    {caseDetails.documentOrderingUrl && (
                      <a
                        href={caseDetails.documentOrderingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-file-download"></i>
                        <span>Order Court Documents</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'ai-analysis' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <i className="fa-solid fa-robot text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-white text-2xl font-semibold">AI Case Analysis</h3>
                  <p className="text-gray-300">Comprehensive AI-powered insights and document analysis</p>
                </div>
              </div>

              <AIOverview 
                caseId={caseDetails.caseNumber}
                caseTitle={caseDetails.title}
                caseStatus={caseDetails.status}
                court="San Diego Superior Court"
                judge={caseDetails.judge || 'Hon. Judge Smith'}
                parties={{
                  plaintiff: 'Case Plaintiff',
                  defendant: 'Case Defendant'
                }}
                lastLogin={new Date().toISOString()}
                className="mb-6"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="apple-card p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-file-text text-blue-400"></i>
                    Document Analysis
                  </h4>
                  <p className="text-gray-300 text-sm mb-4">
                    AI will analyze all case documents once we have access to the county API keys.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Motion analysis and deadline tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Evidence review and categorization</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Legal precedent identification</span>
                    </div>
                  </div>
                </div>

                <div className="apple-card p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-green-400"></i>
                    Case Strategy
                  </h4>
                  <p className="text-gray-300 text-sm mb-4">
                    AI-powered recommendations for case strategy and next steps.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Strategic recommendations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Risk assessment and mitigation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Timeline optimization</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hearings Tab */}
          {activeTab === 'hearings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xl font-semibold">Hearing Schedule</h3>
                <button
                  onClick={handleSyncHearings}
                  disabled={isSyncing}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <i className="fa-solid fa-sync"></i>
                  <span>Sync Hearings</span>
                </button>
              </div>
              {/* Hearing list would go here */}
            </div>
          )}

          {/* Tentative Rulings Tab */}
          {activeTab === 'rulings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xl font-semibold">Tentative Rulings</h3>
                <button
                  onClick={handleSyncTentativeRulings}
                  disabled={isSyncing}
                  className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <i className="fa-solid fa-sync"></i>
                  <span>Check Rulings</span>
                </button>
              </div>
              {/* Tentative rulings list would go here */}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <DocumentManager caseNumber={caseDetails.caseNumber} />
          )}

          {/* Court Rules Tab */}
          {activeTab === 'court-rules' && (
            <CourtRulesAI 
              caseNumber={caseDetails.caseNumber}
              onResults={handleCourtRulesResults}
            />
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <CaseMonitor 
              caseNumber={caseDetails.caseNumber}
              onUpdate={(caseData) => {
                console.log('Case updated:', caseData)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
