'use client'

import { useState, useEffect } from 'react'
import AICaseChat from './AICaseChat'

interface AIOverviewProps {
  caseId?: string
  caseTitle?: string
  caseStatus?: string
  caseType?: string
  court?: string
  judge?: string
  parties?: {
    plaintiff: string
    defendant: string
  }
  lastLogin?: string
  upcomingHearings?: Array<{
    date: string
    time: string
    type: string
    location: string
    virtualMeeting?: string
  }>
  caseHistory?: Array<{
    date: string
    event: string
    description: string
  }>
  documents?: string[]
  className?: string
}

export default function AIOverview({ 
  caseId, 
  caseTitle, 
  caseStatus,
  caseType = 'Family Law',
  court, 
  judge, 
  parties,
  lastLogin,
  upcomingHearings,
  caseHistory,
  documents,
  className = '' 
}: AIOverviewProps) {
  const [isThinking, setIsThinking] = useState(false)
  const [overview, setOverview] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Generate AI overview when case changes
  useEffect(() => {
    if (!caseId) return

    generateAIOverview(caseId, caseTitle, caseStatus, court, judge, parties, lastLogin)
  }, [caseId, caseTitle, caseStatus, court, judge, parties, lastLogin])

  const generateAIOverview = async (
    caseId: string, 
    caseTitle?: string, 
    caseStatus?: string, 
    court?: string, 
    judge?: string, 
    parties?: { plaintiff: string; defendant: string },
    lastLogin?: string
  ) => {
    setIsThinking(true)
    setIsComplete(false)
    setOverview('')

    try {
      // Extract case type from title (e.g., "Johnson v. Martinez - Dissolution with Minor Children")
      const caseTypeMatch = caseTitle?.match(/- (.+)$/)
      const caseType = caseTypeMatch ? caseTypeMatch[1] : "Family Law"
      
      // Prepare case data using actual selected case information
      const caseData = {
        caseNumber: caseId,
        caseTitle: caseTitle || `Case ${caseId}`,
        caseType: `Family Law - ${caseType}`,
        status: caseStatus || "Active",
        dateFiled: "March 15, 2024", // Could be enhanced to use real date if available
        parties: {
          petitioner: parties?.plaintiff || "Unknown",
          respondent: parties?.defendant || "Unknown",
          petitionerAttorney: "Law Office of Smith & Associates",
          respondentAttorney: "Martinez Family Law Group"
        },
        courtLocation: court || "San Diego Superior Court",
        judicialOfficer: judge || "Hon. Rebecca Kanter"
      }

      // Call API to generate AI insights
      const response = await fetch('/api/ai/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      })

      if (!response.ok) {
        throw new Error(`AI insights failed: ${response.status}`)
      }

      const result = await response.json()
      const insights = result.insights
      
      // Format the overview with court details
      let formattedOverview = ''
      
      // Extract case type in lowercase for better readability
      const simpleCaseType = caseType.toLowerCase()
      
      if (lastLogin) {
        const timeSinceLogin = Date.now() - new Date(lastLogin).getTime()
        const daysSinceLogin = Math.floor(timeSinceLogin / (1000 * 60 * 60 * 24))
        const hoursSinceLogin = Math.floor(timeSinceLogin / (1000 * 60 * 60))
        const minutesSinceLogin = Math.floor(timeSinceLogin / (1000 * 60))
        
        let timeString = ''
        if (daysSinceLogin > 0) {
          timeString = `${daysSinceLogin} day${daysSinceLogin === 1 ? '' : 's'} ago`
        } else if (hoursSinceLogin > 0) {
          timeString = `${hoursSinceLogin} hour${hoursSinceLogin === 1 ? '' : 's'} ago`
        } else if (minutesSinceLogin > 0) {
          timeString = `${minutesSinceLogin} minute${minutesSinceLogin === 1 ? '' : 's'} ago`
        } else {
          timeString = 'just now'
        }
        
        formattedOverview = `Since your last login ${timeString}, case ${caseId} (${simpleCaseType}) is currently in ${caseStatus?.toLowerCase() || 'active'} status. `
      } else {
        formattedOverview = `Case ${caseId} (${simpleCaseType}) is currently in ${caseStatus?.toLowerCase() || 'active'} status. `
      }
      
      // Extract department from court string if available
      const departmentMatch = court?.match(/Department (\d+)/)
      const department = departmentMatch ? departmentMatch[1] : '602'
      const courtName = court?.replace(/\s*\(Department \d+\)/, '') || 'San Diego Superior Court - Central'
      
      formattedOverview += `Upcoming hearing scheduled for 1/27/2026 at 9:00 AM - request for order hearing. The case is assigned to ${judge || 'Hon. Rebecca Kanter'} in Department ${department} at ${courtName}. Virtual attendance available via Zoom ID: 123-456-7890, Passcode: 123456.\n\n${insights}`

      setOverview(formattedOverview)
      setIsComplete(true)
    } catch (error) {
      console.error('AI Overview Error:', error)
      // Fallback to mock data if AI fails
      const fallbackOverview = generateFallbackOverview(caseId, lastLogin)
      setOverview(fallbackOverview)
      setIsComplete(true)
    } finally {
      setIsThinking(false)
    }
  }

  const generateFallbackOverview = (caseId: string, lastLogin?: string) => {
    const courtData = {
      caseNumber: caseId,
      courtLocation: 'San Diego Superior Court - Central',
      department: '602',
      judge: 'Hon. Rebecca Kanter',
      nextHearing: '1/27/2026 at 9:00 AM',
      hearingType: 'Request for Order Hearing',
      virtualMeeting: 'Zoom ID: 123-456-7890, Passcode: 123456',
      caseStatus: 'Post Judgment',
      caseType: 'Dissolution with Minor Children'
    }
    
    const baseOverview = `Case ${caseId} (${courtData.caseType}) is currently in ${courtData.caseStatus} status. Upcoming hearing scheduled for ${courtData.nextHearing} - ${courtData.hearingType}. The case is assigned to ${courtData.judge} in Department ${courtData.department} at ${courtData.courtLocation}. Virtual attendance available via ${courtData.virtualMeeting}.`
    
    if (lastLogin) {
      const daysSinceLogin = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24))
      return `Since your last login ${daysSinceLogin} days ago, ${baseOverview.toLowerCase()}`
    }
    
    return baseOverview
  }

  return (
    <div className={`apple-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <i className="fa-solid fa-robot text-white text-sm"></i>
        </div>
        <h3 className="text-white font-semibold text-lg">AI Case Overview</h3>
      </div>

      <div className="min-h-[120px] flex items-center justify-center">
        {isThinking ? (
          <div className="text-center">
            <div className="ai-thinking-container mb-4">
              <div className="ai-thinking-text">
                <span className="ai-thinking-char">A</span>
                <span className="ai-thinking-char">n</span>
                <span className="ai-thinking-char">a</span>
                <span className="ai-thinking-char">l</span>
                <span className="ai-thinking-char">y</span>
                <span className="ai-thinking-char">z</span>
                <span className="ai-thinking-char">i</span>
                <span className="ai-thinking-char">n</span>
                <span className="ai-thinking-char">g</span>
                <span className="ai-thinking-char">.</span>
                <span className="ai-thinking-char">.</span>
                <span className="ai-thinking-char">.</span>
              </div>
            </div>
            <div className="ai-pulse-dots">
              <div className="ai-pulse-dot"></div>
              <div className="ai-pulse-dot"></div>
              <div className="ai-pulse-dot"></div>
            </div>
          </div>
        ) : isComplete ? (
          <div className="ai-overview-content">
            <p className="text-gray-300 leading-relaxed">{overview}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <i className="fa-solid fa-sparkles"></i>
                <span>AI-generated summary</span>
              </div>
              <button
                onClick={() => setShowChat(!showChat)}
                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-comments"></i>
                <span>{showChat ? 'Hide Chat' : 'Ask AI'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <i className="fa-solid fa-robot text-4xl mb-4 opacity-50"></i>
            <p>Select a case to generate AI overview</p>
          </div>
        )}
      </div>

      {/* AI Case Chat */}
      {showChat && isComplete && caseId && (
        <div className="mt-6">
          <AICaseChat
            caseNumber={caseId}
            caseTitle={caseTitle || 'Case Details'}
            caseStatus={caseStatus || 'Active'}
            caseType={caseType}
            court={court || 'San Diego Superior Court'}
            judge={judge || 'Hon. Judge'}
            parties={parties || { plaintiff: 'Plaintiff', defendant: 'Defendant' }}
            upcomingHearings={upcomingHearings}
            caseHistory={caseHistory}
            documents={documents}
          />
        </div>
      )}

      <style jsx>{`
        .ai-thinking-container {
          position: relative;
        }

        .ai-thinking-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: #a855f7;
          display: inline-block;
        }

        .ai-thinking-char {
          display: inline-block;
          animation: ai-thinking 1.5s ease-in-out infinite;
          animation-fill-mode: both;
        }

        .ai-thinking-char:nth-child(1) { animation-delay: 0s; }
        .ai-thinking-char:nth-child(2) { animation-delay: 0.1s; }
        .ai-thinking-char:nth-child(3) { animation-delay: 0.2s; }
        .ai-thinking-char:nth-child(4) { animation-delay: 0.3s; }
        .ai-thinking-char:nth-child(5) { animation-delay: 0.4s; }
        .ai-thinking-char:nth-child(6) { animation-delay: 0.5s; }
        .ai-thinking-char:nth-child(7) { animation-delay: 0.6s; }
        .ai-thinking-char:nth-child(8) { animation-delay: 0.7s; }
        .ai-thinking-char:nth-child(9) { animation-delay: 0.8s; }
        .ai-thinking-char:nth-child(10) { animation-delay: 0.9s; }
        .ai-thinking-char:nth-child(11) { animation-delay: 1.0s; }
        .ai-thinking-char:nth-child(12) { animation-delay: 1.1s; }

        @keyframes ai-thinking {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
            color: #a855f7;
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
            color: #ec4899;
          }
        }

        .ai-pulse-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }

        .ai-pulse-dot {
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          border-radius: 50%;
          animation: ai-pulse 1.5s ease-in-out infinite;
        }

        .ai-pulse-dot:nth-child(1) { animation-delay: 0s; }
        .ai-pulse-dot:nth-child(2) { animation-delay: 0.2s; }
        .ai-pulse-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes ai-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .ai-overview-content {
          animation: ai-fade-in 0.8s ease-out;
        }

        @keyframes ai-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
