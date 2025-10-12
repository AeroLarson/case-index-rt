'use client'

import { useState, useEffect } from 'react'

interface AIOverviewProps {
  caseId?: string
  lastLogin?: string
  className?: string
}

export default function AIOverview({ caseId, lastLogin, className = '' }: AIOverviewProps) {
  const [isThinking, setIsThinking] = useState(false)
  const [overview, setOverview] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // Simulate AI thinking and generating overview
  useEffect(() => {
    if (!caseId) return

    setIsThinking(true)
    setIsComplete(false)
    setOverview('')

    // Simulate AI processing time
    const thinkingTime = Math.random() * 3000 + 2000 // 2-5 seconds

    setTimeout(() => {
      setIsThinking(false)
      setIsComplete(true)
      
      // Generate mock AI overview
      const mockOverview = generateMockOverview(caseId, lastLogin)
      setOverview(mockOverview)
    }, thinkingTime)
  }, [caseId, lastLogin])

  const generateMockOverview = (caseId: string, lastLogin?: string) => {
    // Mock court data based on San Diego court structure
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
            <div className="mt-4 flex items-center gap-2 text-sm text-purple-400">
              <i className="fa-solid fa-sparkles"></i>
              <span>AI-generated summary</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <i className="fa-solid fa-robot text-4xl mb-4 opacity-50"></i>
            <p>Select a case to generate AI overview</p>
          </div>
        )}
      </div>

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
